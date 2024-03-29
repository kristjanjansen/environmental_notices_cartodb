function setPager(year, week) {
  
    var date_prev = moment().year(year).isoweek(week).subtract('days', 7);
    if (date_prev.year() < year && date_prev.isoweek() < week ) {
      date_prev.add('years', 1);
    }

    var date_next = moment().year(year).isoweek(week).add('days', 7);
    if (date_next.year() > year && date_next.isoweek() > week) {
      date_next.subtract('years', 1);
    }
  
    var date_now = moment().year(year).isoweek(week)
  
    console.log('Now ' + date_now.format('DD MM YYYY') + ' ' + date_now.isoweek())
    console.log('Prev ' + date_prev.format('DD MM YYYY') + ' ' + date_prev.isoweek())
    console.log('Next ' + date_next.format('DD MM YYYY') + ' ' + date_next.isoweek())
  
  $('#prev').attr('href', '#/p/' + date_prev.year() + '/' + date_prev.isoweek())
  $('#next').attr('href', '#/p/' + date_next.year() + '/' + date_next.isoweek()); 
  $('#logo').attr('href', '#/p/' + moment().year() + '/' + moment().isoweek()); 

}

function drawMap(year, week) {
  
$.getJSON('/config.json', function(CONFIG) {
  
  
$('#map').gmap('destroy').gmap({
  'center': '58.58,25.1', 
  'zoom': 7,
  'mapTypeId': google.maps.MapTypeId.ROADMAP
});

$("#info").on("click", function(event) {
  $("#info-content").toggleClass('hidden')
  $("#content").toggleClass('inactive')
});

    setPager(year, week);
   
    $('#content').html('<div>Uuendan andmeid...</div>');
        
    var from = moment().year(year).isoweek(week).isoday(1).format('YYYY-MM-DDTHH:mm:ssZ');
    var to = moment().year(year).isoweek(week).isoday(7).format('YYYY-MM-DDTHH:mm:ssZ');
       
    var url = "http://" + CONFIG.cartoUser + ".cartodb.com/api/v2/sql?q=SELECT id, priority, date, type, description, description_short, ST_AsGeoJSON(the_geom) as the_geom FROM " + CONFIG.cartoTable + " WHERE priority > 0 AND date >= '" + from + "' AND date <= '" + to + "' ORDER BY priority DESC, id ASC"
    
    console.log(url);
    
      $.ajaxSetup({
//        cache: false
      });
      
      $.getJSON(url, function(data) {

      var icon = new google.maps.MarkerImage("frontend/images/marker_16x16.png");
      var content = '';
      if (data.rows.length > 0) {
        
      var len = data.rows.length;
      for (var i = 0; i < len; i++) {
        
        var the_geom = $.parseJSON(data.rows[i].the_geom)

        var date = moment(data.rows[i].date).format('DD.MM.YYYY');
        content += 
          '<div id="' + data.rows[i].id + '"' + (the_geom ? ' class="marker" ' : '') + '><h3>' + 
          data.rows[i].type + '</h3>' + '<span>' + 
          date + '</span><div class="short">' + data.rows[i].description_short + '</div><p>' + 
          data.rows[i].description + 
          '<a target="_blank" href="http://www.ametlikudteadaanded.ee/index.php?act=1&teade=' + 
          data.rows[i].id.split('-')[0] + '"><br /><span data-j18s>Read more</span></a></p></div>';
          
          if (the_geom) {
            var rowLatlng = new google.maps.LatLng(the_geom.coordinates[1],the_geom.coordinates[0]);
        
            $('#map').gmap('addMarker', {
              position: rowLatlng,
              icon: icon,
              id: data.rows[i].id,
            })
            .click(function() {
              selectMarker(this.id, true)
            });
 
          }
  
      }
    
      $('#content').html(content);

      $("#content div").on('click', function(ev){
        selectMarker($(this).attr("id"));
      });
      
      $("#content p").addClass('hidden');
    } else {
      $('#content').html('<div>Sel nädalal pole andmeid kogutud. Vaata eelmist või järgmist nädalat</div>');     
    }
    });



})

};



function selectMarker(id, scroll) {
  $('.selected').removeClass('selected');
  $('#'+ id).addClass('selected');
  $('#content p').addClass('hidden'); 
  $('#content .short').removeClass('hidden'); 
  $('#'+ id + ' .short').addClass('hidden');
  $('#'+ id + ' p').removeClass('hidden');
  
  if (scroll) {
    $('#'+ id).scrollIntoView(false); 
  }
  
  var marker = $('#map').gmap('get', 'markers')[id]
  var center = new google.maps.LatLng(58.58, 25.1)
  
  if (marker) {
    $('#map').gmap('option', 'center', marker.position);
    $('#map').gmap('option', 'zoom', 14);    
  } else {
    $('#map').gmap('option', 'center', center);
    $('#map').gmap('option', 'zoom', 7);            
  }
}