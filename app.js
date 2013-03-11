var os = require("os");
var path = require('path')

var config = require('config');
var schedule = require('node-schedule');
var tako = require('tako');
var moment = require('moment');

var scrape = require('./lib/scrape');

// Schedule background tasks

var rule = new schedule.RecurrenceRule();
rule.minute = config.scrapeMinute;

var s = schedule.scheduleJob(rule, function(){
    console.log(moment().format(), 'Launching scraper');
    scrape.scrape(function() {
      console.log(moment().format(), 'Finishing scraper');      
    });
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

console.log(moment().format(), 'Running on ' + os.hostname() + ':'+ config.httpPort);
