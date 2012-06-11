/*
require('date-utils');
var scraper = require('scraper');
var Iconv  = require('iconv').Iconv;
var request = require('request');
var GoogleClientLogin = require('googleclientlogin').GoogleClientLogin;
*/
var schedule = require('node-schedule');
// var w = require('./worker');

var rule = new schedule.RecurrenceRule();
rule.minute = new schedule.Range(0, 60, 1);

// w.worker();

var j = schedule.scheduleJob(rule, function(){
    console.log('Launching new worker');
    // w.worker();
});