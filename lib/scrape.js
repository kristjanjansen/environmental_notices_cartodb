var CONFIG = require('config');

require('date-utils');
var scraper = require('scraper');
var request = require('request');
var moment = require('moment');

var fusion = require('./fusion');
var utils = require('./utils');

var MAX_PAGES = 50;

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

exports.scrape = function() {

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

// fusion.clearTable(CONFIG.googleFusionTableID, function() {


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
        var date = $(this).find('td[width=85]').text().trim();
        row.Date = moment(date, 'DD.MM.YYYY').format('MMM DD, YY');
        row.Type = $(this).find('td.teateliik').text().trim();

        var description_raw = $(this).next().find('td[colspan=4]').text().trim();
        row.Description = description_raw;
        row.Category = '';
        row.CategoryId = '';
        
        // Fetching geocoordinates from geonames based on description field
                
        var url = 'http://api.geonames.org/searchJSON?' + utils.obj2url({
          q: row.Description.replace(/ /gi, ','),
          username: CONFIG.geonamesUsername,
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
 //               row.Description.substr(0, 300);
                row.Description;

                // Merging a row to Google Fusion table
                                
                fusion.merge(CONFIG.googleFusionTableID, row, 'Id', function(body) {

                  console.log(body);

                });

          }
        });

      }

  });

},
{

  'reqPerSec': 1

});

//});

};