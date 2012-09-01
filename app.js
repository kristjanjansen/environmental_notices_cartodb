var CONFIG = require('config');

var schedule = require('node-schedule');
tako = require('tako');
path = require('path')

var scrape = require('./scrape');

var rule = new schedule.RecurrenceRule();
rule.minute = new schedule.Range(0, 60, (CONFIG.updateRate || 10));

var j = schedule.scheduleJob(rule, function(){
    console.log('Launching scraper');
    scrape.scrape();
});

// Serve app
 
app = tako();

app.route('/').file(path.join(__dirname, 'static/index.html'));
app.route('/static/*').files(path.join(__dirname, 'static'));
app.route('/config.json').json({googleFusionTableID: CONFIG.googleFusionTableID});

app.httpServer.listen(CONFIG.httpPort);
