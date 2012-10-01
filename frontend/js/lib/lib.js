function setPager(year, week) {

  var date_prev = moment().year(year).isoweek(week).subtract('w', 1);
  if (date_prev.subtract('d', 6).year() < year) {
    date_prev.subtract('year', 1);
  }
  var date_next = moment().year(year).isoweek(week).add('w', 1);
  if (date_next.add('d', 6).year() > year) {
    date_next.add('year', 1);
  }
  $('#prev').attr('href', '/p/' + date_prev.year() + '/' + date_prev.isoweek()); 
  $('#next').attr('href', '/p/' + date_next.year() + '/' + date_next.isoweek()); 

  var date = date_prev.format('DD/MM/YYYY') + ' - ' + date_next.format('DD/MM/YYYY')
  $('#date').html(date); 
}

function drawMap(year, week, tableId, apiKey, numResults) {
  
  
  var tableId;
  var apiKey;
  var numResults;
  

  
$('#map').gmap('destroy').gmap({
  'center': '58.58,25.1', 
  'zoom': 7,
  'mapTypeId': google.maps.MapTypeId.ROADMAP
});


    //var week = moment().subtract('w', 1).isoweek();
    
    var from = moment().year(year).isoweek(week).isoday(1).format('DD/MM/YYYY');
    var to = moment().year(year).isoweek(week).isoday(7).format('DD/MM/YYYY');
    
    var sql = "SELECT * FROM " + tableId + " WHERE Date >= '" + from + "' AND Date <= '" + to + "' ORDER BY Date DESC LIMIT " + (numResults || 10);

    
      $.ajaxSetup({
        cache: false
      });
      
      $.getJSON('https://www.googleapis.com/fusiontables/v1/query?sql=' + encodeURIComponent(sql) + '&key=' + apiKey, function(data) {



      var icon = new google.maps.MarkerImage("https://raw.github.com/kristjanjansen/environmental_notices/master/static/images/marker_16x16.png");
      var content = '';
      var len = data.rows.length;
      for (var i = 0; i < len; i++) {

        var loc = data.rows[i][3].split(':');
        content += 
          '<div id="'+data.rows[i][0]+'"><h3>' + 
          data.rows[i][2] + ' ' +
          data.rows[i][1] + ' ' + 
          loc[0] + '</h3><p>' + 
          data.rows[i][3] + 
          '<a target="_blank" href="http://www.ametlikudteadaanded.ee/index.php?act=1&teade=' + 
          data.rows[i][0]+'"><br /><span data-j18s>Read more</span></a></p></div>';
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
  
      $('#content').html(content);
      $("#content p").addClass('hidden');
  
    });

    $("#content div").live("click", function(event){
      var id = $(this).attr("id");
      var marker = $('#map').gmap('get', 'markers')[id];
      selectMarker('#map', marker);
    });



};





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
}