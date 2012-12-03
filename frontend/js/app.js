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
    Davis.location.replace(new Davis.Request ({
      fullPath: '/p/' + moment().year() + '/' + moment().isoweek()
    }));
  })

})


$(document).ready(function () {
  Davis.extend(Davis.hashRouting({ forceHashRouting: true }))
  app.start()
});

