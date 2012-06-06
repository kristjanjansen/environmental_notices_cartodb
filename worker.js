require('date-utils');
var scraper = require('scraper');
var Iconv  = require('iconv').Iconv;
var request = require('request');
var csv = require('csv');

var iconv = new Iconv('ISO-8859-15', 'UTF-8');

var MAX_PAGES = 1;
var USERNAME = 'keskkonnateated';

var table_id = '1RHc5WYocfri-0qxY8ragYxObAGXLUxBK-hRQ4vg';

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

fusion_sql('DELETE FROM ' + table_id + ';', function() {


scraper(	

	uris[0], 

	function(err, $) {
		if (err) {
			throw err;
		}

	var count = 0;

	
	var a = '';
	var b = [];
	
	$('table[cellpadding=3] tr').each(function(i, item) {
			
			
			if (i % 3 == 0) {

				var row = {};
			
				row.Type = $(this).find('td.teateliik').text().trim();
				var link = $(this).find('td.right a').attr('href').split('=');
				row.Id = link[link.length - 1];
			
				var description_raw = $(this).next().find('td[colspan=4]').text().trim();
				row.Description = iconv.convert(new Buffer(description_raw, 'binary')).toString();
	
				var url = 'http://api.geonames.org/searchJSON?' + array2url({
					q: row.Description.replace(/ /gi, ','),
					username: USERNAME,
					operator: 'OR',
					formatted: 'true',
					maxRows: 1,
					lang: 'et',
					style: 'SHORT',
					country: 'EE',
					featureCode: 'PPL',  
				});
								
				request({url:url, json:true}, function (error, response, body) {
					
					if (!error && response.statusCode == 200) {

			 		 	row.Lat = body.geonames[0].lat;
			 		 	row.Lng = body.geonames[0].lng;	
			 		 	row.Geometry = 
			 				 '<Point><coordinates>' + body.geonames[0].lat +',' + body.geonames[0].lng +'</coordinates></Point>';
						row.Description = JSON.stringify(body.geonames[0]) + ' ' + row.Description;
						
						console.log(row.Id);
												
						fusion_insert(table_id, row, function(aaa) {
							console.log(aaa);
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

// Utility function to convert keyed array to URL components

function array2url(values) {
	var url = [];
	for (key in values) {
		 url.push(key + '=' + encodeURIComponent(values[key]));
	}
	return url.join('&');
}



// Utility function to make a SQL query to Google Fusion table

function fusion_sql(sql, callback) {

	var api_key = 'AIzaSyBXyUdnzaES3vqQluaE6f2UIswT1YExFB4';
	var email = 'keskkonnateated@gmail.com';
	var password = 'teatedkonnakesk';

	var url = 'https://www.googleapis.com/fusiontables/v1/query?' + array2url({
		sql: sql,
		key: api_key 
	});

	var GoogleClientLogin = require('googleclientlogin').GoogleClientLogin;
	var googleAuth = new GoogleClientLogin({
		email: email,
		password: password,
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

function fusion_insert(table_id, row, callback) {

	var sql_keys = "";
	var sql_values = "";

	for(var key in row) {
		sql_keys += key + ', ';
		sql_values += "'" + row[key] + "', ";
	}

	var sql = 
		"INSERT INTO " + 
		table_id +
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