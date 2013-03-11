var config = require('config');
var schedule = require('node-schedule');

var mail = require('./lib/mail');

var m = schedule.scheduleJob(config.mailMinute + ' ' + config.mailHour + ' * * ' + config.mailDay, function(){
  console.log('Sending mail');
  mail.mail();
})
