var utils = module.exports;

/**
 * Returns XOR checksum number (0 ~ 255).
 *
 * @param {Array} data
 * @return {Number}
 */

exports.lrc = function (data) {
  var checksum = 0;
  for (var i = 0, len = data.length; i < len; i++) {
    var item = data[i];
    checksum = (checksum + item) & 0xFF;
  };
  checksum = ((checksum ^ 0xFF) + 1) & 0xFF;
  return checksum;
}

/**
 * Returns random number of range 0 to 99.
 *
 * @return {Number}
 */

exports.rangedRand = function () {
  var max = 99
    , min = 1;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * hash helper
 *
 * @param {Number} n
 * @return {String}
 * @api public
 */

// n = 2 => return 16 bit (n * 4 * 2)
exports.generateHash = function (n) {
  var out = ''
    , len = 4 * n
    , expect = len * 2;
  for (var i = 0; i < len; i++) {
    var rr =[utils.rangedRand(), utils.rangedRand(), utils.rangedRand()]
      , hex = utils.lrc(rr).toString(16);
    out += hex;
  };
  function addition() {
    out += (function(){
      return Math.floor(Math.random() * (15 - 0 + 1))
    })().toString(16);
    if (out.length < expect) {
      addition();
    };
  }
  if (out.length < expect) {
    addition();
  };
  return out;
}

/**
 * Escape special characters in the given string of file name
 *
 * @param {String} name
 */

exports.escape = function(name) {
  return String(name)
    .replace(/\\/g, '')
    .replace(/\//g, '')
    .replace(/\|/g, '-')
    .replace(/\*/g, '')
    .replace(/\?/g, '')
    .replace(/:/g, '-')
    .replace(/"/g, '');
}

/**
 * Check a type of object
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

exports.isArray = function(obj) {
  return toString.call(obj) == '[object Array]';
}

exports.isObject = function(obj) {
  return obj === Object(obj);
};

exports.isFunction = function(obj) {
  return toString.call(obj) == '[object Function]';
}
exports.isNumber =  function(obj) {
  return toString.call(obj) == '[object Number]';
}

exports.isString = function(obj) {
  return toString.call(obj) == '[object String]';
}


