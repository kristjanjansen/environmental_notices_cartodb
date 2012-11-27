function setPager(year, week) {
  
  var date_prev = moment().year(year).isoweek(week).subtract('days', 7);
  var date_next = moment().year(year).isoweek(week).add('days', 7);

  $('#prev').attr('href', '/p/' + date_prev.year() + '/' + date_prev.isoweek()); 
  $('#next').attr('href', '/p/' + date_next.year() + '/' + date_next.isoweek()); 
  $('#logo').attr('href', '/p/' + moment().year() + '/' + moment().isoweek()); 

}

function drawMap(year, week, cartoUser, cartoTable, numResults) {
  
  
  var tableId;
  var apiKey;
  var numResults;
  
  
  
$('#map').gmap('destroy').gmap({
  'center': '58.58,25.1', 
  'zoom': 7,
  'mapTypeId': google.maps.MapTypeId.ROADMAP
});
  
    setPager(year, week);
   
    $('#content').html('<div>Loading...</div>');
    
    
    var from = moment().year(year).isoweek(week).isoday(1).format('YYYY-MM-DDTHH:mm:ssZ');
    var to = moment().year(year).isoweek(week).isoday(7).format('YYYY-MM-DDTHH:mm:ssZ');
       
    var url = "http://" + cartoUser + ".cartodb.com/api/v2/sql?q=SELECT id, date, type, description, ST_AsGeoJSON(the_geom) as the_geom FROM " + cartoTable + " WHERE date >= '" + from + "' AND date <= '" + to + "' ORDER BY id DESC"
    
    console.log(url);
    
      $.ajaxSetup({
        cache: false
      });
      
      $.getJSON(url, function(data) {



      var icon = new google.maps.MarkerImage("frontend/images/marker_16x16.png");
      var content = '';
      if (data.rows) {
        
      var len = data.rows.length;
      for (var i = 0; i < len; i++) {
        
        var the_geom = $.parseJSON(data.rows[i].the_geom)

        var date = moment(data.rows[i].date).format('DD.MM.YYYY');
        content += 
          '<div id="' + data.rows[i].id + '"' + (the_geom ? ' class="marker" ' : '') + '><h3>' + 
          data.rows[i].type + '</h3>' + '<span>' + 
          date + '</span><p>' + 
          data.rows[i].description + 
          '<a target="_blank" href="http://www.ametlikudteadaanded.ee/index.php?act=1&teade=' + 
          data.rows[i].id + '"><br /><span data-j18s>Read more</span></a></p></div>';
          
          if (the_geom) {
            var rowLatlng = new google.maps.LatLng(the_geom.coordinates[1],the_geom.coordinates[0]);
        
            $('#map').gmap('addMarker', {
              position: rowLatlng,
              icon: icon,
              id: data.rows[i].id,
            })
            .click(function() {
              selectMarker(null, this);
            });
 
          }
  
      }
      $('#content').html(content);
      $("#content p").addClass('hidden');
    } else {
      $('#content').html('<div>No results</div>');     
    }
    });

    $("#content div").live("click", function(event){
      selectNotice($(this).attr("id"));
      selectMarker(false, $(this).attr("id"));
    });



};

function selectNotice(id) {
  $('.selected').removeClass('selected');
  $('#'+ id).addClass('selected');
  $('#content p').addClass('hidden'); 
  $('#'+ id + ' p').removeClass('hidden');
}  

function selectMarker(marker, id) {
  var marker = (marker || $('#map').gmap('get', 'markers')[id])
  var center = new google.maps.LatLng(58.58, 25.1)
  
  if (marker) {
    $('#map').gmap('option', 'center', marker.position);
    $('#map').gmap('option', 'zoom', 14);    
  } else {
    $('#map').gmap('option', 'center', center);
    $('#map').gmap('option', 'zoom', 7);            
  }
}

/*
function selectMarker(map, marker, scroll, hasMarker, id) {
  if (hasMarker && marker) {
    $(map).gmap('option', 'center', marker.position);
    $(map).gmap('option', 'zoom', 14);
  } else {
    $(map).gmap('option', 'center', google.maps.LatLng(58.58,25.1));
    $(map).gmap('option', 'zoom', 7);    
  }
  $('.selected').removeClass('selected');
  $('#'+ id).addClass('selected');
  if (scroll) {
    $('#'+ id).scrollIntoView(false); 
  }
  $('#content p').addClass('hidden'); 
  $('#'+ id + ' p').removeClass('hidden');
}
*/