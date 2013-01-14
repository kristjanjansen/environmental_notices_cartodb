var nodemailer = require("nodemailer");
var config = require("config");
var moment = require("moment");
require("moment-isocalendar");
var request = require("request");

exports.mail = function() {

var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: config.mailUsername,
        pass: config.mailPassword
    }
});


var from = moment().isoday(1).subtract('days', 7).format('YYYY-MM-DDTHH:mm:ssZ');
var to = moment().isoday(7).subtract('days', 7).format('YYYY-MM-DDTHH:mm:ssZ');

var url = "http://" + config.cartoUser + ".cartodb.com/api/v2/sql?q=SELECT id, priority, date, type, description, ST_AsGeoJSON(the_geom) as the_geom FROM " + config.cartoTable + " WHERE priority > 0 AND date >= '" + from + "' AND date <= '" + to + "' ORDER BY priority DESC, id ASC"

request({url: url, json: true}, function (err, res, data) {
  if (!err && res.statusCode == 200) {
    var msg = ''
 
    for (var i=0; i < data.rows.length; i++) {
      var url_source = 'Allikas: <a href="http://www.ametlikudteadaanded.ee/index.php?act=1&teade=' + data.rows[i].id.split('-')[0] + '">AT</a>' 
      var url_site = (data.rows[i].the_geom) ? 'Link: http://keskkonnateated.ee/#/p/' + moment(data.rows[i].date).year() + '/' + moment(data.rows[i].date).isoweek() + '/' + data.rows[i].id + '<br />': ''
      msg += '<b>' + 
      data.rows[i].type + 
      '</b>' +
      '<br />' + 
      moment(data.rows[i].date).format('DD.MM.YYYY') +
      ' ' + 
      url_source +
      '<br /><br />' +
      data.rows[i].description + '<br /><br /><br />'
    };
    msg += '---<br /><br />Keskkonnateated<br />http://keskkonnateated.ee<br />keskkonnateated@gmail.com'
    var mailOptions = {
        from: config.mailFrom,
        to: config.mailTo, 
        subject: 'Test: Keskkonnateated ' + moment().isoday(1).subtract('days', 7).format('DD.MM.YYYY') + ' - ' + moment().isoday(7).subtract('days', 7).format('DD.MM.YYYY'),
        html: msg
    }
    
    smtpTransport.sendMail(mailOptions, function(error, response){
        if(error){
            console.log(error);
        }else{
            console.log("Message sent: " + response.message);
        }
        smtpTransport.close();
    });

    
  }
})

}
