var querystring = require('querystring')
  , extname = require('path').extname
  , parse = require('url').parse
  , utils = require('./utils')

/**
 * Expose `options`
 */

exports = module.exports = Options;

function Options() {
  this.random = true;
};

/**
 * Assign `setting` to `val, or return `setting`'s value.
 * If `setting` is url and `val` is String convert url to
 * object using `url.parse`.
 */

Options.prototype.set = function(setting, val) {
  if (1 == arguments.length) {
    if (this.hasOwnProperty(setting)) {
      return this[setting];
    }
  } else {
    if (setting == 'url' && 'string' == typeof val) {
      if (0 != val.indexOf('http')) val = 'http://' + val;
      utils.merge(this, parse(val));
    };
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

Options.prototype.stringify = function(obj) {
  return querystring.stringify(obj, ';');
}

/**
 *
 * @api public
 */

Options.prototype.enable = function(setting) {
  return this.set(setting, true);
}

Options.prototype.disable = function(setting) {
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
    Options.prototype.proxy = proxy;
  };
}

/**
 * Check if the url is binary Object
 *
 * @return {Boolean}
 * @api public
 */

Options.prototype.isbinary = function() {
  var ext;
  if (this.pathname == undefined) {
    ext = extname(this.url);
  } else {
    ext = extname(this.pathname);
  };
  return (ext != '.html' && ext != '.htm' && ext != '')
    ? true
    : false;
}

/**
 * Import proxys to iterate
 *
 * @param {Array} obj
 * @api public
 */

Options.prototype.load = function(obj) {
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

Options.prototype.readProxy = function() {
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

Options.prototype.evalProxy = function(statusCode, cwp) {
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

