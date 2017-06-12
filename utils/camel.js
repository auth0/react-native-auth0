function snakeToCamel(str) {
  var parts = str.split('_');
  return parts.reduce(function(p, c) {
    return p + c.charAt(0).toUpperCase() + c.slice(1);
  }, parts.shift());
}

function toCamelCase(object, exceptions) {
  if (typeof object !== 'object' || toString.call(object) === '[object Array]' || object === null) {
    return object;
  }

  exceptions = exceptions || [];

  return Object.keys(object).reduce(function(p, key) {
    var newKey = exceptions.indexOf(key) === -1 ? snakeToCamel(key) : key;
    p[newKey] = toCamelCase(object[key]);
    return p;
  }, {});
}

module.exports = { snakeToCamel, toCamelCase };