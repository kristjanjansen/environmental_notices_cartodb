var GoogleClientLogin = require('googleclientlogin').GoogleClientLogin;
var request = require('request');
var CONFIG = require('config');
var utils = require('./utils');

// Make a SQL query to a Google Fusion table

exports.sql = function(sql, callback) {

  var url = 'https://www.googleapis.com/fusiontables/v1/query?' + utils.obj2url({
    sql: sql,
    key: CONFIG.googleFusionTableApikey
  });

  var googleAuth = new GoogleClientLogin({
    email: CONFIG.googleUsername + '@gmail.com',
    password: CONFIG.googlePassword,
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


// Make a INSERT query to Google Fusion table

exports.insert = function(google_fusion_table_id, row, callback) {

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
    
  exports.sql(sql, function(body) {
    
    return callback(body);
  });

}