var os = require("os");
var path = require('path')

var config = require('config');
var schedule = require('node-schedule');
var express = require('express');
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
 
app = express()

app.use('/frontend', express.static(__dirname + '/frontend'))

app.get('/config.json', function(req, res){
  res.send({
    cartoUser: config.cartoUser,
    cartoTable: config.cartoTable
  });
});

app.get('/', function(req, res){
  res.sendfile(__dirname + '/frontend/index.html');
});

app.listen(config.httpPort)

console.log(moment().format(), 'Running on ' + os.hostname() + ':'+ config.httpPort);
