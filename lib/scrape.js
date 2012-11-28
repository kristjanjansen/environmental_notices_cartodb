var CONFIG = require('config');
var request = require('request');
var $ = require('cheerio')
var each = require('each')
var moment = require('moment')

var CartoDB = require('cartodb');
var cdb = new CartoDB({user: CONFIG.cartoUser,api_key: CONFIG.cartoKey});

var types = {
    '580082': 'Geneetiliselt muundatud organismide keskkonda viimise teated',
    '170163': 'Geoloogilise uuringu loa taotlemisteated',
    '170162': 'Geoloogilise uuringu load',
    '170249': 'Jahipiirkonna kasutusõiguse loa taotlemisteated',
    '170250': 'Jahipiirkonna kasutusõiguse lubade teated',
    '532826': 'Jäätmekavade algatamise teated',
    '170175': 'Jäätmeloa andmise teated',
    '170174': 'Jäätmeloa taotlemisteated',
    '170176': 'Kaevandamisloa taotlemisteated',
    '170177': 'Kaevandamisloa väljastamisteated',
    '170178': 'Keskkonnamõju hindamise teated',
    '170251': 'Loodusobjekti kaitse alla võtmise teated',
    '170190': 'Maa riigi omandisse jätmise teated',
    '170191': 'Maakonnaplaneeringu kehtestamisteated',
    '170207': 'Saasteloa taotlemisteated',
    '170208': 'Saasteloa väljastamisteated',
    '301254': 'Saastuse kompleksloa taotlemise teated',
    '301253': 'Saastuse kompleksloa väljastamise teated',
    '170212': 'Vee erikasutusloa taotlemise teated',
    '170213': 'Vee erikasutusloa väljastamisteated',
    '301251': 'Veemajanduskava algatamise menetluse teated',
    '301252': 'Veemajanduskava kinnitamise teade',
};

var keys = []
var urls = []

exports.scrape = function() {
  
// Setup

cdb.connect();

cdb.on('error', function(error) {
    console.log(error.text ? error.text : '');
});

cdb.on('data', function(data) {
    console.log(data)
});

for (var key in types) {
  keys.push(key);
}

// Dummy item for first task

urls.push('')

// Build URL array

for (var i=1; i < (((CONFIG.scrapePages || 1) - 1) * 10) + 11 ; i = i + 10) {
  urls.push('http://www.ametlikudteadaanded.ee/index.php?act=1&salguskpvavald=' + moment().subtract('M', 1).format('DD.MM.YYYY') + '&sloppkpvavald=' + moment().format('DD.MM.YYYY') + '&steateliigid=' + keys.join(';') + '&srange=' + i + '-' + (i + 9));
}

// Scrape pages

each(urls)
  .on('item', function(next, url, i) {
   if (i == 0) { 
      cdb.query('delete from ' + CONFIG.cartoTable) 
      setTimeout(next, 0)
    } else {
      request({url: url, encoding: 'binary'}, function (e, r, body) {
        processPage(body, function(rows) {
          setTimeout(next, 0)
        })
      });
    }
    
})




function processPage(body, callback, next) {

  var rows = []
 
  var body = $.load(body)
  var body_rows = []

  each(body('table[cellpadding=3] tr').toArray())
    .on('item', function(next_row, body_row, i) {
      if (i % 3 == 0) {
        
        var row = {}
        var link = $(body_row).find('td.right a').attr('href').split('=')
        row.id = link[link.length - 1]
        row.date = moment($(body_row).find('td[width=85]').text().trim(), 'DD.MM.YYYY').format('YYYY-MM-DDTHH:mm:ssZ');
        row.type = $(body_row).find('td.teateliik').text().trim();
        row.description = $(body_row).next().find('td[colspan=4]').text().trim();
       
        processRow(row, function(p_row) {
          var query = "INSERT INTO " + CONFIG.cartoTable + " (id, date, type, description" + (p_row.the_geom ? ", the_geom" : "") + ") VALUES ('" + p_row.id + "', '" + p_row.date + "', '" + p_row.type + "', '" + p_row.description + "'" + (p_row.the_geom ? ", " + p_row.the_geom : "") + ")"
          cdb.query(query)         
        })
              
      } 
      setTimeout(next_row, (CONFIG.scrapeDelay || 0))
      
    })
    .on('end', function() {
      return callback(null)
    })
  
}

function processRow(row, callback) {

  row.lat = ''
  row.lng = ''
  row.the_geom = ''
  
  row.description = row.description.replace(/((ht|f)tp:\/\/w{0,3}[a-zA-Z0-9_\?\&\=\-.:#/~}]+)/gi, '<a target="_blank" href="$1">$1</a>')
    
  row.description = row.description.replace(/^[a-zöäõüšž ]+: /gi,'')
  row.description = row.description.replace(/(\d{8})(?!">|<\/)/g,'<a target="_blank" href="https://ariregister.rik.ee/ettevotja.py?ark=$1">$1</a>')
    
  var cad = row.description.match(/\d+:\d+:\d+/g)
  if (cad) {
    cad2geo(cad[0], function(geo) {
      if (geo) {
        row.lat = geo.y
        row.lng = geo.x
        row.description = row.description.replace(/\b(\d+:\d+:\d+)\b(?!">|<\/)/g,'<a target="_blank" href="http://xgis.maaamet.ee/ky/FindKYByT.asp?txtCU=$1">$1</a>')
        row.the_geom = 'ST_SetSRID(ST_Point('+ geo.x +','+ geo.y +'),4326)'
      }
      return callback(row)
    })
  } else {  
    return callback(row) 
 }
}


  
function cad2geo(cad, callback) {

  var url = 'http://geoportaal.maaamet.ee/url/xgis-ky.php?ky=' + cad + '&what=tsentroid&out=json'
  var lest = []

  request({url:url, json:true}, function (error, response, body) {
    if (body) {
      lest.push(body[1].X)
      lest.push(body[1].Y)
      return callback(lest2geo(lest))
    } else {
      return callback()
    }
  });

}

function lest2geo(lest) {
  var p4js = require("proj4js")
  require('proj4js-defs')(p4js)

  src = new p4js.Proj("EPSG:3301")
  dst = new p4js.Proj("EPSG:4326")
  
  return p4js.transform(src, dst, new p4js.Point(lest))
}

}