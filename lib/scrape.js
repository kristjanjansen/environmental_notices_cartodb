var CONFIG = require('config');
var request = require('request');
var $ = require('cheerio')
var each = require('each')
var moment = require('moment')

var fil = require('../lib/filters')

var types = [ 
  { id: '170178',
    name: 'Keskkonnamõju hindamise teated',
    priority: 7 },
  { id: '170162', 
    name: 'Geoloogilise uuringu load', 
    priority: 6 },
  { id: '170163',
    name: 'Geoloogilise uuringu loa taotlemisteated',
    priority: 6 },
  { id: '170176',
    name: 'Kaevandamisloa taotlemisteated',
    priority: 5 },
  { id: '170177',
    name: 'Kaevandamisloa väljastamisteated',
    priority: 5 },
  { id: '170251',
    name: 'Loodusobjekti kaitse alla võtmise teated',
    priority: 4 },
  { id: '301253',
    name: 'Saastuse kompleksloa väljastamise teated',
    priority: 3 },
  { id: '301254',
    name: 'Saastuse kompleksloa taotlemise teated',
    priority: 3 },
  { id: '170212',
    name: 'Vee erikasutusloa taotlemise teated',
    priority: 2 },
  { id: '170213',
    name: 'Vee erikasutusloa väljastamisteated',
    priority: 2 },
  { id: '170190',
    name: 'Maa riigi omandisse jätmise teated',
    priority: 1 },
  { id: '170191',
    name: 'Maakonnaplaneeringu kehtestamisteated',
    priority: 1 },
  { id: '170174', 
    name: 'Jäätmeloa taotlemisteated', 
    priority: 0 },
  { id: '170175', 
    name: 'Jäätmeloa andmise teated', 
    priority: 0 },
  { id: '170207', 
    name: 'Saasteloa taotlemisteated', 
    priority: 0 },
  { id: '170208',
    name: 'Saasteloa väljastamisteated',
    priority: 0 },
  { id: '170249',
    name: 'Jahipiirkonna kasutusõiguse loa taotlemisteated',
    priority: 0 },
  { id: '170250',
    name: 'Jahipiirkonna kasutusõiguse lubade teated',
    priority: 0 },
  { id: '301251',
    name: 'Veemajanduskava algatamise menetluse teated',
    priority: 0 },
  { id: '301252',
    name: 'Veemajanduskava kinnitamise teade',
    priority: 0 },
  { id: '532826',
    name: 'Jäätmekavade algatamise teated',
    priority: 0 },
  { id: '580082',
    name: 'Geneetiliselt muundatud organismide keskkonda viimise teated',
    priority: 0 } 
]


var keys = []
var urls = []

exports.scrape = function(callback) {
  
  // Setup


  types.forEach(function(item) {
    keys.push(item.id)
  })

  // Dummy item for first task

  urls.push('')

  // Build URL array

  var start = (((CONFIG.pageStart || 1) - 1) * 10) + 1
  var stop = (((CONFIG.pageCount || 1) - 1) * 10) + 11 + (start - 1)

  for (var i = start; i < stop; i = i + 10) {
    urls.push('http://www.ametlikudteadaanded.ee/index.php?act=1&salguskpvavald=' + moment().subtract('M', 1).format('DD.MM.YYYY') + '&sloppkpvavald=' + moment().format('DD.MM.YYYY') + '&steateliigid=' + keys.join(';') + '&srange=' + i + '-' + (i + 9));
  }

  // Scrape pages
  each(urls)
    .parallel(true)
    .on('item', function(next, url, i) {
     if (i == 0) { 
       var url = 'http://' + CONFIG.cartoUser + '.cartodb.com/api/v2/sql?q=DELETE FROM ' + CONFIG.cartoTable + '&api_key=' + CONFIG.cartoKey
        request({url: url, json: true}, function(err, res, body) {
          if (body && body.error) console.log(body)   
          console.log(moment().format(), 'Deleting table');      
          setTimeout(next, 0)
        })
      } else {
        request({url: url, encoding: 'binary'}, function (err, res, body) {
          if (err) throw err   
          processPage(body, function(rows) {
            console.log(moment().format(), 'Processed page', i);      
            setTimeout(next, 0)
          })
        });
      }
    
    })
    .on('end', function() {
      console.log(moment().format(), 'Done');          
      callback()
    })

 
}

function processPage(body, callback, next) {

  var rows = []
 
  var body = $.load(body)
  var body_rows = []

  each(body('table[cellpadding=3] tr').toArray())
    .on('item', function(next_row, body_row, i) {
      if (i % 3 == 0) {
        
        var row = {}
        var link = $(body_row).find('td.right a').attr('href').split('=')
        row.id = link[link.length - 1] + '-0'
        row.date = moment($(body_row).find('td[width=85]').text().trim(), 'DD.MM.YYYY').format('YYYY-MM-DDTHH:mm:ssZ');
        row.type = $(body_row).find('td.teateliik').text().trim();
        row.description = $(body_row).next().find('td[colspan=4]').text().trim().replace("'", "''");
        
        row.priority = types.filter(function(item) {
            return item.name === row.type
        })[0].priority
          
        processRow(row, function(p_row) {
  
          if (p_row.childs.length < 2) {
            p_row.childs.push(p_row)
          }  
            
            each(p_row.childs)
              .on('item', function(next, p_row, i) {
                
                p_row.description = encodeURIComponent(p_row.description)
                p_row.description_short = encodeURIComponent(p_row.description_short)
                
                var url = "http://" + CONFIG.cartoUser + ".cartodb.com/api/v2/sql?q=INSERT INTO " + CONFIG.cartoTable + " (id, priority, date, type, description, description_short" + (p_row.the_geom ? ", the_geom" : "") + ") VALUES ('" + p_row.id + "', '" + p_row.priority + "', '" + p_row.date + "', '" + p_row.type + "', '" + p_row.description + "', '" + p_row.description_short + "'" + (p_row.the_geom ? ", " + p_row.the_geom : "") + ")&api_key=" + CONFIG.cartoKey

                request.post({url: url, json: true}, function (err, res, body) {
                  if (body && body.error) console.log(body)
                  setTimeout(next, 0)
                })
                     
              })
              .on('end', function() {
                setTimeout(next_row, (CONFIG.scrapeDelay || 0))
              })
        })
              
      } else { 
        setTimeout(next_row, (CONFIG.scrapeDelay || 0))
      }
    })
    .on('end', function() {
      return callback(null)
    })
  
}

function processRow(row, callback) {

  var filters = [
    'short',
    'kmh',
    'sadr',
    'biz',
    'permit_waste',
    'permit_complex',
    'permit_air',
    'permit_water',
    'cad2',
    'cad',
    'br'    
  ]
    
  each(filters)
    .on('item', function(next, filter, i) {
      fil[filter](row, function(row) {
        row = row
        setTimeout(next, 0)
      })
    })
    .on('end', function() {
      return callback(row)    
    })
   
}