var app = Davis(function () {

  this.configure(function () {
    this.raiseErrors = true
  })

  this.get('/p/:year/:week', function (req) {
    var year = parseInt(req.params['year']);
    var week = parseInt(req.params['week']);
    drawMap(year, week);    

  });

  this.bind('start', function () {
    var year = moment().year();
    var week = moment().isoweek();
    drawMap(year, week);        
  
})
})


$(document).ready(function () {
  Davis.extend(Davis.hashRouting({ forceHashRouting: true }))
  app.start()
});

