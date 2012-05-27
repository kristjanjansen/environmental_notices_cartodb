require('date-utils');
var scraper = require('scraper');
var Iconv  = require('iconv').Iconv;
var request = require('request');
var csv = require('csv');

var iconv = new Iconv('ISO-8859-15', 'UTF-8');

var MAX_PAGES = 1;
var USERNAME = 'keskkonnateated';

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


var fs = require('fs');

var datafile = __dirname+'/data.csv';

fs.stat(datafile, function(err, stat) {
		if(err == null) {
			fs.unlink(datafile, function (err) {
				if (err) throw err;
			})
		}
})


// Construct array of URLs to scrape

for (var key in TYPES) {
	keys.push(key);
}

for (var i=1; i < (MAX_PAGES * 10) + 11 ; i = i + 10) {
	uris.push(
		{
			'uri' : 'http://www.ametlikudteadaanded.ee/index.php?act=1&salguskpvavald=' + Date.today().addMonths(-1).toFormat('DD.MM.YYYY') + '&sloppkpvavald=' + Date.today().toFormat('DD.MM.YYYY') + '&steateliigid=' + keys.join(';') + '&srange=' + i + '-' + (i + 9), 
			'encoding' : 'binary'
		});
}


// Main scraper loop, using arrays of URLs

scraper(	
	uris, 
	function(err, $) {
		if (err) {
			throw err;
		}

	var count = 0;

	$('table[cellpadding=3] tr').each(function() {
		var row = new Object();
		
		if (count === 0) {
			var link = $(this).find('td.right a').attr('href').split('=');
			row.push(link[link.length - 1]);
			row.push($(this).find('td[width=85]').text().trim());
			row.push($(this).find('td.teateliik').text().trim());
		}
		if (count == 1) {
			var text_raw = $(this).find('td[colspan=4]').text().trim();
			var text = iconv.convert(new Buffer(text_raw, 'binary')).toString();
			row.push(text.substr(50));
		}
		if (count == 2) { 
			str2geo(row[3], function(geo) {
	   		console.log(geo.str.substr(10) + ' ' + geo.lat + ' ' + geo.lng); 
	   	});
	   
			row = [];
			count = -1;
		}
									
		count++;

	});

/*
	  str2geo(data[3], function(geo) {
	  	data.push(geo.lat); 
	  	data.push(geo.lng); 
	  });
*/

},
{
//	'reqPerSec': 10
});


// Utility function to convert keyed array to URL components

function array2url(values) {
	var url = [];
	for (key in values) {
		 url.push(key + '=' + encodeURIComponent(values[key]));
	}
	return url.join('&');
}

// Function to convert address string to lat/lon coordinates

function str2geo(str, callback) {

	var url = 'http://api.geonames.org/searchJSON?' + array2url({
		q: str.replace(/ /gi, ','),
		username: USERNAME,
		operator: 'OR',
		formatted: 'true',
		maxRows: 5,
		lang: 'et',
		style: 'SHORT',
		country: 'EE',
		featureCode: 'PPL',  
	});

	request({url:url,json:true}, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			lat = body.geonames[0].lat;
			lng = body.geonames[0].lng;
			return callback({str: str, lat: lat, lng: lng});
		}
	});

}
