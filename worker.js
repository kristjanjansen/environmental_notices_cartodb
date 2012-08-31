// dev

var CONFIG = require('config');
require('date-utils');
var scraper = require('scraper');
// var Iconv  = require('iconv').Iconv;
var request = require('request');
var GoogleClientLogin = require('googleclientlogin').GoogleClientLogin;
var schedule = require('node-schedule');

// var iconv = new Iconv('ISO-8859-15', 'UTF-8');

var MAX_PAGES = 15;

var google_fusion_table_id = CONFIG.googleFusionTableID;
var google_fusion_apikey = CONFIG.googleFusionTableApikey;
var google_username = CONFIG.googleUsername;
var google_password = CONFIG.googlePassword;
var geonames_username = CONFIG.geonamesUsername;
var httpPort = CONFIG.httpPort;

TYPES = {
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

var uris = [];
var row  = [];
var data  = [];
var keys = [];


// Main worker to scrape avalikudteadaanded.ee pages, geotagging
// the results and writing them to Google Fusion database


function worker() {

// Construct array of URLs to scrape

for (var key in TYPES) {
  keys.push(key);
}

for (var i=1; i < ((MAX_PAGES - 1) * 10) + 11 ; i = i + 10) {
  uris.push(
    {
      'uri' : 'http://www.ametlikudteadaanded.ee/index.php?act=1&salguskpvavald=' + Date.today().addMonths(-1).toFormat('DD.MM.YYYY') + '&sloppkpvavald=' + Date.today().toFormat('DD.MM.YYYY') + '&steateliigid=' + keys.join(';') + '&srange=' + i + '-' + (i + 9), 
      'encoding' : 'binary'
    });
}

// Deleting previous data

fusion_sql('DELETE FROM ' + google_fusion_table_id + ';', function() {


// Running scraper for each member of uri array

scraper(	

  uris, 

  function(error, $) {
    if (error) {
      throw error;
    }

  $('table[cellpadding=3] tr').each(function(i, item) {

      // Fetching each third row

      if (i % 3 == 0) {

        var row = {};

        var link = $(this).find('td.right a').attr('href').split('=');

        row.Id = link[link.length - 1];
        row.Date = $(this).find('td[width=85]').text().trim();
        row.Type = $(this).find('td.teateliik').text().trim();

        var description_raw = $(this).next().find('td[colspan=4]').text().trim();
//        row.Description = iconv.convert(new Buffer(description_raw, 'binary')).toString();
        row.Description = description_raw;
        row.Category = '';
        row.CategoryId = '';

        // Fetching geocoordinates from geonames based on description field

        var url = 'http://api.geonames.org/searchJSON?' + array2url({
          q: row.Description.replace(/ /gi, ','),
          username: geonames_username,
          operator: 'OR',
          maxRows: 1,
          fuzzy: 1,
          style: 'SHORT',
          country: 'EE',
          featureClass: 'P',  
           lang: 'et',
        });

        request({url:url, json:true}, function (error, response, body) {

          if (error) {
            throw error;
          }

          if (!error && response.statusCode == 200) {

             row.Lat = (
               (body.geonames[0].lat * 100 + 
               ((Math.random() * 100) + 1) / 100)
               ) / 100 ;
             row.Lng = ((body.geonames[0].lng * 100 + 
               ((Math.random() * 100) + 1) / 100)
               ) / 100 ;
             row.Geometry = 
               '<Point><coordinates>' + 
               row.Lat +
               ',' + 
               row.Lng +
               '</coordinates></Point>';
              row.Description = 
                body.geonames[0].toponymName + 
                ': ' + 
                row.Description.substr(0, 300);

                // Inserting row to Google Fusion table

                fusion_insert(google_fusion_table_id, row, function(body) {

                  console.log(body);

                });

          }
        });

      }

  });

},
{

  //	'reqPerSec': 0.1

});

});

};




// Utility function to convert keyed array to URL components

function array2url(values) {
  var url = [];
  for (key in values) {
     url.push(key + '=' + encodeURIComponent(values[key]));
  }
  return url.join('&');
}



// Utility function to make a SQL query to a Google Fusion table

function fusion_sql(sql, callback) {

  var url = 'https://www.googleapis.com/fusiontables/v1/query?' + array2url({
    sql: sql,
    key: google_fusion_apikey 
  });

  var googleAuth = new GoogleClientLogin({
    email: google_username + '@gmail.com',
    password: google_password,
    service: 'fusiontables',
    accountType: GoogleClientLogin.accountTypes.google
  });

  googleAuth.on(GoogleClientLogin.events.login, function(){

    request({
      url: url,
      json: true, 
      method: 'POST',
      headers: {
        'Authorization': 'GoogleLogin auth=' + googleAuth.getAuthId()
      }			
      }, function (err, response, body) { 
        if (!err && response.statusCode == 200) {
          return callback(body);
        }
      });

  });

  googleAuth.login();

}


// Utility function to make a INSERT query to Google Fusion table

function fusion_insert(google_fusion_table_id, row, callback) {

  var sql_keys = "";
  var sql_values = "";

  for(var key in row) {
    sql_keys += key + ", ";
    sql_values += "'" + row[key] + "', ";
  }

  var sql = 
    "INSERT INTO " + 
    google_fusion_table_id +
    " (" +
    sql_keys.substr(0, sql_keys.length - 2) +
    ") VALUES (" +
    sql_values.substr(0, sql_values.length - 2) +
    ");"
    ;

  fusion_sql(sql, function(body) {
    return callback(body);
  });

}

// Scheduler to launch a worker in every x minutes

var rule = new schedule.RecurrenceRule();
rule.minute = new schedule.Range(0, 60, (CONFIG.updateRate || 10));

var j = schedule.scheduleJob(rule, function(){
    console.log('Launching worker');
    worker();
});


// worker();

// Serve app

tako = require('tako');
path = require('path')
 
app = tako();

app.route('/').file(path.join(__dirname, 'static/index.html'));
app.route('/static/*').files(path.join(__dirname, 'static'));
app.route('/config.json').json({GOOGLE_FUSION_TABLE_ID: google_fusion_table_id});

app.httpServer.listen(CONFIG.httpPort);
