var CONFIG = require('config');

var os = require("os");
var schedule = require('node-schedule');
var tako = require('tako');
var path = require('path')

var scrape = require('./lib/scrape');

// Schedule scraper to run in certain interval

var rule = new schedule.RecurrenceRule();
rule.minute = new schedule.Range(0, 60, (CONFIG.updateRate || 10));

var j = schedule.scheduleJob(rule, function(){
    console.log('Launching scraper');
    scrape.scrape();
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
