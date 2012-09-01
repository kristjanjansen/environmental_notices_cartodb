// Utility function to convert object to URL parameter string

exports.obj2url = function(obj) {
  var url = [];
  for (key in obj) {
     url.push(key + '=' + encodeURIComponent(obj[key]));
  }
  return url.join('&');
}