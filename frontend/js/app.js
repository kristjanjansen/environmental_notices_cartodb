var app = Davis(function () {

  this.configure(function () {
    this.raiseErrors = true
  })

  this.get('/p/:year/:week', function (req) {
    var year = parseInt(req.params['year']);
    var week = parseInt(req.params['week']);
     $.getJSON('/config.json', function(data) {
       drawMap(year, week, data.googleFusionTableId, data.googleFusionTableApiKey);    
    });

  });

  this.bind('start', function () {
    var year = moment().year();
    var week = moment().isoweek();
    $.getJSON('/config.json', function(data) {
      drawMap(year, week, data.googleFusionTableId, data.googleFusionTableApiKey);    
   });
  
})
})


$(document).ready(function () {
  Davis.extend(Davis.hashRouting({ forceHashRouting: true }))
  app.start()
});

