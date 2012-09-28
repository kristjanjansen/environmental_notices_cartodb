$(document).ready(function() {

j18s.on("change", function(lang){
  $.getJSON("frontend/translations/"+ lang + ".json", function(langData){
    j18s.addLang(lang, langData);
  });
});

j18s.setLang("et");

$.getJSON('config.json', function(data) {
  tableId = data.googleFusionTableId,
  apiKey = data.googleFusionTableApiKey
  
$('#map').gmap({
  'center': '58.58,25.1', 
  'zoom': 7,
  'mapTypeId': google.maps.MapTypeId.ROADMAP
  })
  .bind('init', function(evt, map) { 

    var sql = 'SELECT * FROM ' + tableId + ' LIMIT 10';

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
  
      $('#content').html(content);
      $("#content p").addClass('hidden');
  
    });

    $("#content div").live("click", function(event){
      var id = $(this).attr("id");
      var marker = $('#map').gmap('get', 'markers')[id];
      selectMarker('#map', marker);
    });

  
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
}