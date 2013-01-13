var CONFIG = require('config');

var os = require("os");
var schedule = require('node-schedule');
var tako = require('tako');
var path = require('path')

var scrape = require('./lib/scrape');
var mail = require('./lib/mail');

// Schedule background tasks

var s = schedule.scheduleJob({minute: CONFIG.scrapeMinute}, function(){
    console.log('Launching scraper');
//    scrape.scrape();
});

var m = schedule.scheduleJob({minute: CONFIG.mailMinute}, function() {
//  console.log('Sending mail');
  //mail.mail();
})

// Create config for frontend and serve files
 
app = tako();

app.route('/config.json').json({
  cartoUser: CONFIG.cartoUser,
  cartoTable: CONFIG.cartoTable,
});

app.route('/').file(path.join(__dirname, 'frontend/index.html'));
app.route('/frontend/*').files(path.join(__dirname, 'frontend'));
app.httpServer.listen(CONFIG.httpPort);

console.log('Running on ' + os.hostname() + ':'+ CONFIG.httpPort);
