var request = require('../node_modules/request')
  , fs = require('fs')
  , path = require('path')
  , join = path.join
  , basename = path.basename
  , extname = path.extname
  , parse = require('url').parse
  , utils = require('./utils')
  , mkdirp = require('../node_modules/mkdirp')
  , querystring = require('querystring')

/**
 * Expose `options`
 */

var options = module.exports =  function(url) {
  if (0 != url.indexOf('http')) url = 'http://' + url;
  options.url = url;
  options.jar = request.jar();
  options.random = true;
  return options;
}

options.set = function(setting, val) {
  if (1 == arguments.length) {
    if (this.hasOwnProperty(setting)) {
      return this[setting];
    }
  } else {
    this[setting] = val;
    return this;
  }
}

/**
 * Convert Object to String
 *
 * @param {Object} obj
 * @return {String}
 * @api public
 */

options.stringify = function(obj) {
  return querystring.stringify(obj, ';');
}

/**
 * Add cookies to `jar`
 *
 * @param {Array|String} obj
 * @return {options}
 * @api public
 */

options.addCookie = function(obj) {
  if (utils.isArray(obj)) {
    var jar = options.jar;
    for (var i = 0, len = obj.length; i < len; i++) {
      var item = obj[i];
      jar.add(request.cookie(item));
    };
    return this;
  };
  if ('string' == typeof obj) {
    options.jar.add(request.cookie(obj));
  };
  return this;
}

/**
 * Don't use cookie jar = false
 *
 * @api public
 */

options.usejar = function() {
  return this.jar = request.jar();
}

options.enable = function(setting) {
  return this.set(setting, true);
}

options.disable = function(setting) {
  return this.set(setting, false);
}

/**
 * proxy
 */

function proxy() {
  obj.withproxy = action.withproxy;
  if (action.withproxy) {
    var proxy = this.readProxy(true);
    if (0 != proxy.indexOf('http')) proxy = 'http://' + proxy;
    options.proxy = proxy;
  };
}

/**
 * Check if the url is binary Object
 *
 * @return {Boolean}
 * @api public
 */

options.isbinary = function() {
  var ext = extname(this.url);
  return (ext != '.html' && ext != '.htm' && ext != '')
    ? true
    : false;
  // options.encoding = null
}

/**
 * Import proxys to iterate
 *
 * @param {Array} obj
 * @api public
 */

options.load = function(obj) {
  this._proxy = -1;
  this.proxyList = obj.map(function(d) {
    return {useful: true, data: d, succeed: 0, fail: 0}
  });
}

/**
 * Create Boolean randomly.
 */

function randomBool() {
  var max = 0
    , min = 0;
  return Math.round(Math.random() * (max - min + 1)) + min ? true : false;
}

/**
 * read proxy list randomly or ascending
 *
 * @return {String}
 * @api private
 * TODO
 * shuffle, reset?
 */

options.readProxy = function() {
  var proxy = ''
    , proxyList = this.proxyList;
  if (this.random) {
    // random
    for (var i = 0, len = proxyList.length; i < len; i++) {
      if (randomBool()) continue;
      var item = proxyList[i];
      if (!item.useful) continue;
      this._proxy = i;
      proxy = item.data;
      break;
    };
    // shuffle, reset?
    if (proxy === '') {
      proxyList.map(function(d){
        d.useful = true;
        return d;
      });
      return this.readProxy();
    };
  } else {
    // sequential
    var nn = this._proxy + 1
      , item = proxyList[nn];
    if (item === undefined) nn = 0;
    this._proxy = nn;
    proxy = proxyList[nn].data;
  };
  return proxy;
};

/**
 * Set proxy status. When proxy get 5xx, the proxy treat as `fail`.
 * Otherwise `succeed`.
 *
 * @param {Number} cwp
 * @api private
 */

options.evalProxy = function(statusCode, cwp) {
  var index = this._proxy
    , useful = true
  if (499 < statusCode) {
    this.proxyList[index]['fail'] += 1
    this.proxyList[index]['useful'] = false
    useful = false
  } else {
    this.proxyList[index]['succeed'] += 1
    useful = true
  };
  return useful;
};

