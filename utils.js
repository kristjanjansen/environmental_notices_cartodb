// Utility function to convert keyed array to URL components

exports.obj2url = function(obj) {
  var url = [];
  for (key in obj) {
     url.push(key + '=' + encodeURIComponent(obj[key]));
  }
  return url.join('&');
}