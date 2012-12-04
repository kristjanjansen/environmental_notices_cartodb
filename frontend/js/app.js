var app = Davis(function () {

  this.configure(function () {
    this.raiseErrors = true
    this.generateRequestOnPageLoad = true        
  })

  this.get('/', function (req) {
    drawMap(moment().year(), moment().isoweek())
  });

  this.get('/p/:year/:week', function (req) {
    drawMap(parseInt(req.params['year']), parseInt(req.params['week']));    
  });
  
})


$(document).ready(function () {
  Davis.extend(Davis.hashRouting({ forceHashRouting: true }))
  app.start()
});

