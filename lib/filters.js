var request = require('request');
var $ = require('cheerio')

// row.descriptionription = row.descriptionription.replace(/((ht|f)tp:\/\/w{0,3}[a-zA-Z0-9_\?\&\=\-.:#/~}]+)/gi, '<a target="_blank" href="$1">$1</a>')

exports.br = function(item, callback) {
 
 item.description = item.description.replace(/\n/g,'<br /><br />')    
 return callback(item)    

}

exports.biz = function(item, callback) {
  
  var regexp = /(\d{8})/g
  
  var matches = item.description.match(regexp)
  if (matches) {
    item.description = item.description.replace(regexp,'<a target="_blank" href="https://ariregister.rik.ee/ettevotja.py?ark=$1">$1</a>')    
    return callback(item)    
  } else {
    return callback(item)    
  }
}


exports.sadr = function(item, callback) {
  
  var regexp = /http:\/\/www\.keskkonnaamet\.ee\/sadr\/\?id=(\d{4,})\&?/g
  
  var matches = item.description.match(regexp)

  if (matches) {
    var id = matches[0].split('=')[1]
    if (id.substr(id.length - 1) == '&') {
      id = id.substr(0, id.length - 1)
    }
    item.id = id
    var site_url = 'http://www.keskkonnaamet.ee/sadr'
    var url = site_url + '/index.php?id=' + item.id
  
    request.get(url,
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          var body = $.load(body)
          item.url_sadr = site_url + '/' + body('#ADR_search_result_data tr').first().find('td').first().attr('onclick').split("'")[1]           
          item.description = item.description.replace(regexp,'<a target="_blank" href="' + item.url_sadr + '">'+site_url+'</a>')
          return callback(item)
        }
    })
  
  } else {
    return callback(item)    
  }
}


exports.cad = function(item, callback) {
  
  var regexp = /(\d+:\d+:\d+)/g
  
  var matches = item.description.match(regexp)
  if (matches) {
    item.cad = matches[0] 
    cad2geo(item.cad, function(geo) {
       var url = 'http://xgis.maaamet.ee/ky/FindKYByT.asp?txtCU='
       item.lat = geo.y
       item.lng = geo.x
       item.the_geom = 'ST_SetSRID(ST_Point('+ geo.x +','+ geo.y +'),4326)'
       item.url_cad = url + item.cad
       item.description = item.description.replace(regexp,'<a target="_blank" href="'+ url + '$1">$1</a>')
       return callback(item)
   })
 } else {
   return callback(item)    
 }
}




exports.permit_waste = function(item, callback) {
 
 // TODO: L.JÄ.LV-200276 has different layout
  
  var regexp = /L\.JÄ(\/|.LV-)\d{6,}/g
  
  var matches = item.description.match(regexp)
  if (matches) {

    item.id_permit = matches[0] 
    
    get_permit_page(item.id_permit, function(page) {

      if (page) {

       var body = $.load(page.body)    
       var permit = {}

       item.url_permit = page.url
       item.description = item.description.replace(regexp,'<a target="_blank" href="' + item.url_permit + '">' + item.id_permit + '</a>')
       
       url = 'http://klis2.envir.ee/' + body('.relation_heading_row').eq(2).parent().find('.list_data a').eq(0).attr('href')
           
       request.get(url, function (error, response, body) {
         var body = $.load(body);
         
         point = body('#global_table_layer td').eq(2).find('td').text().match(/(\d+)/g)
         if (point) {
         var geo = lest2geo([point[1],point[0]])

         item.lat = geo.y
         item.lng = geo.x
         item.the_geom = 'ST_SetSRID(ST_Point('+ geo.x +','+ geo.y +'),4326)'

         item.geoname = body('#global_table_layer td').eq(0).find('td').text()
         item.cad = body('#global_table_layer td').eq(3).find('td').text()
         
         item.description = item.description.replace(regexp,'<a target="_blank" href="' + item.url_permit + '">' + item.id_permit + '</a> (' + item.geoname + ' ' + item.cad + ')')
         
         }
         return callback(item)
       
       })                      
      } else {

        return callback(item)
        
      }
      
     })
 
  } else {
   return callback(item)    
 }
}





exports.permit_complex = function(item, callback) {
  
  var regexp = /KKL\/\d{6,}/g
  
  var matches = item.description.match(regexp)
  if (matches) {

    item.id_permit = matches[0] 
    
    get_permit_page(item.id_permit, function(page) {
  
      if (page) {
       var body = $.load(page.body)    
       var permit = {}

       item.url_permit = page.url
       
       var x = body('#exp_col_layer_3048 tr:nth-child(9) td').text()
       var y = body('#exp_col_layer_3048 tr:nth-child(8) td').text()
       var geo = lest2geo([x,y])
       
       item.lat = geo.y
       item.lng = geo.x
       item.the_geom = 'ST_SetSRID(ST_Point('+ geo.x +','+ geo.y +'),4326)'
       
       item.description = item.description.replace(regexp,'<a target="_blank" href="' + item.url_permit + '">' + item.id_permit + '</a>')
      }
       return callback(item)

     })
 
  } else {
   return callback(item)    
 }
}



exports.permit_air = function(item, callback) {

  
  var regexp = /L\.ÕV(\/|\.VÕ\-)\d{6,}/g
  
  var matches = item.description.match(regexp)
  if (matches) {

    item.id_permit = matches[0] 
    
    get_permit_page(item.id_permit, function(page) {

      if (page) {

       var body = $.load(page.body)    
       var permit = {}

       item.url_permit = page.url
       
       var x = body('#exp_col_layer_1566 tr:nth-child(4) td').text()
       var y = body('#exp_col_layer_1566 tr:nth-child(3) td').text()
       
       var geo = lest2geo([x,y])
       
       item.lat = geo.y
       item.lng = geo.x
       item.the_geom = 'ST_SetSRID(ST_Point('+ geo.x +','+ geo.y +'),4326)'
       
       item.description = item.description.replace(regexp,'<a target="_blank" href="' + item.url_permit + '">' + item.id_permit + '</a>')
     }
       return callback(item)

     })
 
  } else {
   return callback(item)    
 }
}


exports.permit_water = function(item, callback) {
  
  var regexp = /L\.VV\/\d{6,}/g
  
  var matches = item.description.match(regexp)
  if (matches) {

    item.id_permit = matches[0] 
    
    get_permit_page(item.id_permit, function(page) {

      if (page) {

       var body = $.load(page.body)    

       item.url_permit = page.url       
       
       item.description = item.description.replace(regexp,'<a target="_blank" href="' + item.url_permit + '">' + item.id_permit + '</a>')
      }
       return callback(item)

     })
 
  } else {
   return callback(item)    
 }
}





function get_permit_page(id_permit, callback) {

var permit_site_url = 'http://klis2.envir.ee' 
  
request.post(
    permit_site_url,
    { 
      form: { 
        search: 'Otsi',
        field_674766_search_type: 'CO',
        field_1063_search_type: 'CO',
        field_1063_search_value: id_permit,
        field_70599_search_type: 'CO',
        field_1066_search_type: 'CO',
        field_1077_search_type: 'CO',
        page: 'klis_pub_list_dynobj',
        tid: '1031'
      } 
    },
    function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var body = $.load(body)
            var link = body('.list_data td:first-child a')
            var permit_type = link.text()
            var url = permit_site_url + link.attr('href')
            
            if (permit_type) {   
              request.get(url, function (error, response, body) {
                return callback({url: url, body:body})                                
              })
            } else {
              return callback()
            }
        }
      })
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
