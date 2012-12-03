var app = Davis(function () {

  this.configure(function () {
    this.raiseErrors = true
  })

        
  this.get('/p/:year/*week', function (req) {
    var path = req.params['week'].split('/').filter(function(a) {
      return parseInt(a)
    })
    if (!path[1]) {
      drawMap(parseInt(req.params['year']), path[0]);
    } else {
      selectMarker(path[1])
    }
  });

  this.bind('start', function () {
    drawMap(moment().year(), moment().isoweek())
  })

  
})


$(document).ready(function () {
  Davis.extend(Davis.hashRouting({ forceHashRouting: true, normalizeInitialLocation: true }))
  app.start()
});

