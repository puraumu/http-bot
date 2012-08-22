/**
 * Module dependencies.
 */

var tty = require('tty')
  , fs = require('fs')
  , join = require('path').join
  , parse = require('url').parse
  , utils = require('./utils')
  , mkdirp = require('../node_modules/mkdirp')

/**
 * Expose `View`
 */

exports = module.exports = View;

/**
 * Initialize `View`
 */

function View() {
  this.silent = false;
  this.warning = true;
  this.request = true;
  this.response = true;
  this.debug = false;
  this.dir = join(__dirname, '/../sites');
};

/**
 * Check if both stdio streams are associated with a tty.
 */

var isatty = tty.isatty(1) && tty.isatty(2);

/**
 * Default color map.
 */

var colors = {
    'pass': 90
  , 'fail': 31
  , 'pending': 36
  , 'checkmark': 32
  , 'fast': 90
  , 'yellow': 33
  , 'slow': 31
  , 'green': 32
  , 'light': 90
  , 'magenta': 35
};

/**
 * Color `str` with the given `type`,
 * allowing colors to be disabled,
 * as well as user-defined color
 * schemes.
 *
 * @param {String} type
 * @param {String} str
 * @return {String}
 * @api private
 */

var color = function(type, str) {
  if (!isatty) return str;
  return '\u001b[' + colors[type] + 'm' + str + '\u001b[0m';
};

/**
 * Enable `setting`.
 *
 * @param {String} setting
 * @return {app} for chaining
 * @api public
 */

View.prototype.enable = function(setting) {
  return this.set(setting, true);
};

/**
 * Disable `setting`.
 *
 * @param {String} setting
 * @return {app} for chaining
 * @api public
 */

View.prototype.disable = function(setting) {
  return this.set(setting, false);
};

/**
 * Assign `setting` to `val`, or return `setting`'s value.
 *
 * @param {String} setting
 * @param {String} val
 * @return {Robot}
 * @api public
 */

View.prototype.set = function(setting, val){
  if (1 == arguments.length) {
    if (this.hasOwnProperty(setting)) {
      return this[setting];
    }
  } else {
    this[setting] = val;
    return this;
  }
};

/**
 * View request headers
 *
 * @param {request} req
 * @api private
 */

View.prototype.displayRequest = function(headers, url) {
  var stout = " "
    , exist = headers.exist
        ? color('checkmark', '✔')
        : color('fail', '✖')
    , proxy = !!headers.proxy ? headers.proxy : ''
    , method = color('magenta', headers.method)
  stout += '%s %s %s';
  if (proxy != '') stout += " " + color('light', '>>') +  " " + proxy;
  console.log(stout, exist, method, url);

  if (this.debug) {
    this.appendReqLog(headers)
  };
}

View.prototype.appendReqLog = function (headers) {
  var dir = this.dir
    , str = ''
  fs.appendFile(dir, str, function(err) {
    if (err) console.error('cannnot append', err);
  });
}

/**
 * View response headers
 *
 * @param {String} type
 * @param {Number} cwp
 * @api private
 */

View.prototype.displayResponse = function(headers, url, duration) {
  var stout = " "
    , statusCode = color('magenta', headers.statusCode)
    , exist = color('checkmark', '✔')
  if (399 < statusCode) exist = color('fail', '✖');
  if (1000 < duration) {
    if (60000 < duration) {
      // minutes
      duration = '(' + String(duration / 60000) + 'm)'
      duration = color('fail', duration)
    } else {
      // seconds
      duration = '(' + String(duration / 1000) + 's)'
      duration = color('yellow', duration)
    };
  } else {
    // milliseconds
    duration = '(' + String(duration) + 'ms)'
    duration = color('light', duration)
  };
  stout += '%s %s %s %s';
  console.log(stout, exist, statusCode, url, duration);

  if (this.debug) {
    this.appendResLog(headers);
  };
};

View.prototype.appendResLog = function (headers) {
  var dir = this.dir
    , str = ''
  var name = join(this._sites, this.siteName, type + '.log')
    , file = "#" + String(cwp) + " " + type + "\n" + JSON.stringify(headers) + "\n\n"
  fs.appendFile(dir, str, function(err) {
    if (err) console.error('cannnot append', err);
  });
}

/**
 * Write errors
 *
 * @param {String} name
 * @api private
 */

View.prototype.writeErrors = function(name) {
  var errors = this.errors
    , file = JSON.stringify(errors);
  fs.writeFile(join(this._sites, this.siteName, name), file, function(err){
    if (err) console.log('writing errors', err, file);
  });
};

/**
 * Write proxyList of current status for later use
 *
 * @api private
 * TODO
 * no need? because accessing proxy list inside `Parse` is hard to do.
 */

View.prototype.writeProxy = function() {
  var proxyList = this.proxyList
    , name = join(this._sites, this.siteName, 'proxy.json')
  proxyList.map(function(d){
    d.useful = true
    if (3 < d.fail) d.useful = false
    return d
  })
  fs.writeFile(name, JSON.stringify(proxyList), function(err){
    if (err) console.log('cannnot write proxyList', err);
  })
};

/**
 * Write files
 * OK
 */

View.prototype.writeValidUrl = function() {
  var dir = join(this._sites, this.siteName)
    urls = this.urls.filter(function(d) {
      return !d.valid
    })
  if (urls.length == 0) return
  console.log('followings are invalid URL:');
  console.log(JSON.stringify(urls));

    // , valid = this.valid
    // , errors = this.errors
  // if (valid.length == 0 && errors.length == 0) return
  // console.log('followings are invalid URL:');
  // console.log(JSON.stringify(errors));
  // fs.writeFileSync(join(dir, 'valid.json'), JSON.stringify(valid))
  // fs.writeFileSync(join(dir, 'errors.json'), JSON.stringify(errors))
};

