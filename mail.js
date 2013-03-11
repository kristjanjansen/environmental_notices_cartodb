var config = require('config');
var schedule = require('node-schedule');

var mail = require('./lib/mail');

var rule = new schedule.RecurrenceRule();
rule.minute = config.mailMinute;
rule.hour = config.mailHour;
rule.day = config.mailDay;

var m = schedule.scheduleJob(rule, function(){
  console.log('Sending mail');
  mail.mail();
})
