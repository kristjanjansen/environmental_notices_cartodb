var config = require('config');

var os = require("os");
var schedule = require('node-schedule');
var tako = require('tako');
var path = require('path')

var scrape = require('./lib/scrape');

// Schedule background tasks

var rule = new schedule.RecurrenceRule();
rule.minute = config.scrapeMinute;

var s = schedule.scheduleJob(rule, function(){
    console.log('Launching scraper');
    scrape.scrape();
});

// Create config for frontend and serve frontend files
 
app = tako();

app.route('/config.json').json({
  cartoUser: config.cartoUser,
  cartoTable: config.cartoTable,
});

app.route('/').file(path.join(__dirname, 'frontend/index.html'));
app.route('/frontend/*').files(path.join(__dirname, 'frontend'));
app.httpServer.listen(config.httpPort);

console.log('Running on ' + os.hostname() + ':'+ config.httpPort);
