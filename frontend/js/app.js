$(document).ready(function() {

j18s.on("change", function(lang){
  $.getJSON("frontend/translations/"+ lang + ".json", function(langData){
    j18s.addLang(lang, langData);
  });
});

j18s.setLang("et");

$('#map').gmap({
  'center': '58.58,25.1', 
  'zoom': 7,
  'mapTypeId': google.maps.MapTypeId.ROADMAP
  })
  .bind('init', function(evt, map) { 


var tableId = '1tPYHIxLHoJceLl-2AgCmVJrFsCNWjAbZnVeZo-4';
var key = 'AIzaSyBXyUdnzaES3vqQluaE6f2UIswT1YExFB4'
var sql = 'SELECT * FROM ' + tableId + ' LIMIT 10';


$.getJSON('https://www.googleapis.com/fusiontables/v1/query?sql=' + encodeURIComponent(sql) + '&key=' + key, function(data) {

  var icon = new google.maps.MarkerImage("https://raw.github.com/kristjanjansen/environmental_notices/master/static/images/marker_16x16.png");
  var content_s = '';
  var len = data.rows.length;
  for (var i = 0; i < len; i++) {

    var loc = data.rows[i][3].split(':');
    content_s += 
    '<div id="'+data.rows[i][0]+'"><h3>' + 
    data.rows[i][2] + ' ' +
    data.rows[i][1] + ' ' + 
    loc[0] + '</h3><p>' + 
    data.rows[i][3] + 
    '<a target="_blank" href="http://www.ametlikudteadaanded.ee/index.php?act=1&teade=' + 
    data.rows[i][0]+'"><br /><span data-j18n>Read more</span></a></p></div>';
    var rowLatlng = new google.maps.LatLng(data.rows[i][7],data.rows[i][8]);
        
    $('#map').gmap('addMarker', {
        position: rowLatlng,
        icon: icon,
        id: data.rows[i][0],
    })
    .click(function() {
      selectMarker('#map', this, true);
    });
 
 
  }
  
  $('#content').html(content_s);
  $("#content p").addClass('hidden');
  
});

  $("#content div").live("click", function(event){
    var id = $(this).attr("id");
    var marker = $('#map').gmap('get', 'markers')[id];
    selectMarker('#map', marker);
  });

  
});



});

function selectMarker(map, marker, scroll) {
  $(map).gmap('option', 'center', marker.position);
  $(map).gmap('option', 'zoom', 8);
  $('.selected').removeClass('selected');
  $('#'+ marker.id).addClass('selected');
  if (scroll) {
    $('#'+ marker.id).scrollIntoView(false); 
  }
  $('#content p').addClass('hidden'); 
  $('#'+ marker.id + ' p').removeClass('hidden');
  console.log(marker);
}

/*
$(document).ready(function() {
 
  var tableid = 0;
  
  $.getJSON('config.json', function(data) {
     tableid = data.googleFusionTableID;
     initialize(tableid);
  });
  
  
  $('#get-data-all').click(function() {
    reset();
  });

  $('#form-select, #form-search').change(function() {
    getDataAddress(tableid);
  });

  $('#form-search').click(function() {
    getDataAddress(tableid);
  });

    
});



var map;
var lastWindow;

var center_lat = 58.58;
var center_lon = 25.1;
var zoom = 7;
var radius = 5000;

var center = new google.maps.LatLng(center_lat, center_lon);

var markersArray = [];

var zoomMap = new Array();
zoomMap[5000] = 12;
zoomMap[10000] = 11;
zoomMap[15000] = 10;

function initialize(tableid) {

  map = new google.maps.Map(document.getElementById('map'), {
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapTypeControl: false,
    streetViewControl: false,
    panControlOptions: {
        position: google.maps.ControlPosition.LEFT_BOTTOM
    },
    zoomControlOptions: {
        style: google.maps.ZoomControlStyle.LARGE,
        position: google.maps.ControlPosition.LEFT_BOTTOM
    },
  });
  
  circle = new google.maps.Circle({
    map: map,
    fillOpacity: 0.2,
    fillColor: "#FF0000",    
    strokeOpacity: 0.5,
    strokeWeight: 1,
    clickable: false,
    zIndex: 0
  });

  query = new google.visualization.Query('http://www.google.com/fusiontables/gvizdata?tq=' + encodeURIComponent("SELECT Id, Date, Type, Description, Geometry, Category, Lat, Lng FROM " + tableid));
  query.send(prepareData);
  map.setCenter(center);
  map.setZoom(zoom);
  circle.setMap();

}

function reset() {
  map.setCenter(center);
  map.setZoom(zoom);
  circle.setMap();
}

function getDataAddress(tableid) {

  var geocoder = new google.maps.Geocoder();
  var new_radius = document.getElementById("form-select").value;
  
  geocoder.geocode( { 
      'address': document.getElementById("form-address").value,
      'region' : 'ee',
      'language' : 'et'
    }, function(results, status) {
    
    if (status == google.maps.GeocoderStatus.OK) {
      
      location_address = results[0].geometry.location;
      
      clearMarkers();
      
      query = new google.visualization.Query('http://www.google.com/fusiontables/gvizdata?tq=' + encodeURIComponent("SELECT Id, Date, Type, Description, Geometry, Category, Lat, Lng FROM " + tableid + " WHERE ST_INTERSECTS(geometry, CIRCLE(LATLNG" + location_address + "," + radius + "))"));
      query.send(prepareData);
      
      map.setCenter(location_address);
      map.setZoom(zoomMap[new_radius]);
      circle.setCenter(location_address);
      circle.setMap(map);
      circle.setRadius(parseInt(new_radius));
      
    } 
  });

}

function prepareData(response) {

  numRows = response.getDataTable().getNumberOfRows();
  numCols = response.getDataTable().getNumberOfColumns();
 
  for (i = 0; i < numRows; i++) {
    var row = [];
    for (j = 0; j < numCols; j++) {
      row.push(response.getDataTable().getValue(i, j));
    }
    drawMarkers(row);
  }  
  if (markersArray) {
    var markerCluster = new MarkerClusterer(map, markersArray, {
      gridSize: 3, 
      styles: [
      {
        height: 53,
        url: "static/images/marker_53x53.png",
        width: 53
      },
      {
        height: 56,
        url: "static/images/marker_56x56.png",
        width: 56
      },
      {
        height: 66,
        url: "static/images/marker_66x66.png",
        width: 66
      },
      {
        height: 78,
        url: "static/images/marker_78x78.png",
        width: 78
      },
      {
        height: 90,
        url: "static/images/marker_90x90.png",
        width: 90
      },      
      ]
    });
  }
}

function drawMarkers(row) {
  
      var marker_coordinate  = new google.maps.LatLng(row[6],row[7]);
  
      var marker = new google.maps.Marker({
          map: map, 
          position: marker_coordinate,
          icon: new google.maps.MarkerImage("static/images/marker_16x16.png"),
          zIndex: 1
      });
        
      markersArray.push(marker);
      
      google.maps.event.addListener(marker, 'click', function(event) {
        date = new Date.parse(row[1].toString().substring(0, 15)).toString('d.M.yyyy'); 
        content = 
           "<h2>" + row[5] + " " + date + "</h2>" +
           "<div class='description'>" + row[3].substring(0, 325) + "...</div>" +
           "<a href='http://www.ametlikudteadaanded.ee/index.php?act=1&teade="  + 
           row[0] + 
           "' target='_BLANK'>Vaata &rarr;</a>";

        if(lastWindow) lastWindow.close(); 
        
        lastWindow = new google.maps.InfoWindow( { 
          position: marker_coordinate,
          content: content,
          maxWidth: 300
        });
        lastWindow.open(map);
      });

}

function clearMarkers() {
  if (markersArray) {
    for (i in markersArray) {
      markersArray[i].setMap(null);
    }
  }
}

window.onkeypress = enterSubmit;
function enterSubmit(tableid) {
  if(event.keyCode==13) {
    getDataAddress(tableid);
  }
}
*/