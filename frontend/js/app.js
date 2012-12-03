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
    drawMap(moment().year(), moment().isoweek())
  })

  this.state('/p/:year/:week/:id', function (req) {
    console.log(req.params['id'])
  });
  
})


$(document).ready(function () {
  Davis.extend(Davis.hashRouting({ forceHashRouting: true }))
  app.start()
});

