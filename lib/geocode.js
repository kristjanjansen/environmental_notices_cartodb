// Geometry, Lat, Lon : text

var CONFIG = require('config');
var request = require('request');
var $ = require('cheerio')
var each = require('each')

var fusion = require('./fusion');
var utils = require('./utils');

var delay = 500

var limit = 1000
var offset = 0

exports.geocode = function() {

fusion.sql("SELECT ROWID, Id, Date, Type, Description, Geometry, Category, CategoryId, Lat, Lng FROM " + CONFIG.googleFusionTableID + " ORDER BY Id DESC OFFSET " + offset + " LIMIT " + limit, function(body) {
  each(body.rows)
    .on('item', function(next, row, i) {
      updateRow(row, function(new_row) {
        fusion.update(CONFIG.googleFusionTableID, new_row, row[0], function(body) {
          console.log(i + ' ' + row[1] + ' ' + body.kind + ' ' + new_row.Lat);
          setTimeout(next, delay)
        }, next, i);
      })
  })
})

function updateRow(row, callback) {

  var new_row = {}
  new_row.Lat = ''
  new_row.Lng = ''
  new_row.Geometry = ''
  
  var desc = row[4]
 
  // desc = desc.replace(/\b((ht|f)tp:\/\/w{0,3}[a-zA-Z0-9_\-.:#/~}]+)\b(?!">|<\/)/gi, '<a target="_blank" href="$1">$1</a>')
  
  desc = desc.replace(/^[a-zöäõüšž ]+: /i,'')
  desc = desc.replace(/(\d{8})(?!">|<\/)/,'<a target="_blank" href="https://ariregister.rik.ee/ettevotja.py?ark=$1">$1</a>')
  
  new_row.Description = desc
  
  var cad = row[4].match(/\d+:\d+:\d+/g)
  if (cad) {
    cad2geo(cad[0], function(geo) {
      if (geo) {
        new_row.Lat = geo.y
        new_row.Lng = geo.x
        new_row.Description = new_row.Description.replace(/\b(\d+:\d+:\d+)\b(?!">|<\/)/g,'<a target="_blank" href="http://xgis.maaamet.ee/ky/FindKYByT.asp?txtCU=$1">$1</a>')
      }
      return callback(new_row)
    })
  } else {  
    return callback(new_row) 
 }
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