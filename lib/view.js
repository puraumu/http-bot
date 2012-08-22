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
 * Check if both stdio streams are associated with a tty.
 */

var isatty = tty.isatty(1) && tty.isatty(2);

/**
 * Enable coloring by default.
 */

exports.useColors = isatty;

/**
 * Default color map.
 */

exports.colors = {
    'pass': 90
  , 'fail': 31
  , 'bright pass': 92
  , 'bright fail': 91
  , 'bright yellow': 93
  , 'pending': 36
  , 'suite': 0
  , 'error title': 0
  , 'error message': 31
  , 'error stack': 90
  , 'checkmark': 32
  , 'fast': 90
  , 'medium': 33
  , 'slow': 31
  , 'green': 32
  , 'light': 90
  , 'magenta': 35
  , 'diff gutter': 90
  , 'diff added': 42
  , 'diff removed': 41
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

var color = exports.color = function(type, str) {
  if (!exports.useColors) return str;
  return '\u001b[' + exports.colors[type] + 'm' + str + '\u001b[0m';
};

/**
 * True to write request and response headers
 */

exports.debug = false;

/**
 * Destination directory
 */

exports.dir = join(__dirname, '/../sites');

/**
 * View request headers
 *
 * @param {request} req
 * @api private
 */

exports.displayRequest = function(headers, url) {
  var stout = " "
    , exist = headers.exist
        ? color('checkmark', '✔')
        : color('fail', '✖')
    , proxy = !!headers.proxy ? headers.proxy : ''
    , method = color('magenta', headers.method)
    // , url = headers.uri.href;
  stout += '%s %s %s';
  if (proxy != '') stout += " " + color('light', '>>') +  " " + proxy;
  console.log(stout, exist, method, url);

  if (exports.debug) {
    appendReqLog(headers)
  };
}

function appendReqLog(headers) {
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

exports.displayResponse = function(headers, url) {
  var stout = " "
    , statusCode = color('magenta', headers.statusCode)
    , exist = color('checkmark', '✔')
    // , url = headers.request.uri.href;
  if (399 < statusCode) exist = color('fail', '✖');
  stout += '%s %s %s';
  console.log(stout, exist, statusCode, url);

  if (exports.debug) {
    appendResLog(headers);
  };
};

function appendResLog(headers) {
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

exports.writeErrors = function(name) {
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

exports.writeProxy = function() {
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

exports.writeValidUrl = function() {
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

