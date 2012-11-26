var CONFIG = require('config');

var os = require("os");
var schedule = require('node-schedule');
var tako = require('tako');
var path = require('path')

var scrape = require('./lib/scrape');
var geocode = require('./lib/geocode');

// Schedule background tasks

var j = schedule.scheduleJob({minute: 0}, function(){
    console.log('Launching scraper');
    scrape.scrape();
});

var j = schedule.scheduleJob({minute: 30}, function(){
    console.log('Launching geocoder');
    geocode.geocode();
});


// Create config for frontend and serve files
 
app = tako();

app.route('/config.json').json({
  googleFusionTableId: CONFIG.googleFusionTableID,
  googleFusionTableApiKey: CONFIG.googleFusionTableApikey,
});

app.route('/').file(path.join(__dirname, 'frontend/index.html'));
app.route('/frontend/*').files(path.join(__dirname, 'frontend'));
app.httpServer.listen(CONFIG.httpPort);

console.log('Running on ' + os.hostname() + ':'+ CONFIG.httpPort);
