var fs = require('fs')
  , join = require('path').join
  , parse = require('url').parse
  , utils = require('./utils')
  , mkdirp = require('../node_modules/mkdirp')

var view = module.exports = function(set) {
  view.debug = set.debug;
  view.dir = set._sites;
  return view;
}

/**
 * View request headers
 *
 * @param {request} req
 * @api private
 */

view.req = function() {
  var stout = " "
    , headers = this.log.req
    , exist = headers.exist
        ? '\033[32m' + '✔' + '\033[0m'
        : '\033[31m' + '✖' + '\033[0m'
    , proxy = !!headers.proxy ? headers.proxy : '';
  stout += exist + " " + '\033[35m' + headers.method + '\033[0m' + " " + headers.url;
  if (proxy != '') stout += " " + '\033[90m' + '>>' + '\033[0m' +  " " + proxy;
  console.log(stout);

  if (this.debug) {
    view.appendReqLog(headers)
  };
}

view.appendReqLog = function(headers) {
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

view.res = function() {
  var stout = " "
    , headers = this.log.res
    , statusCode = headers.statusCode
    , exist = '\033[32m' + '✔' + '\033[0m';
  if (399 < statusCode) exist = '\033[31m' + '✖' + '\033[0m';
  stout += exist + " " + '\033[35m' + statusCode + '\033[0m' + " " + headers.url;
  console.log(stout);

  if (this.debug) {
    view.appendResLog(headers);
  };
};

view.appendResLog = function(headers) {
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

info.writeErrors = function(name) {
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

info.writeProxy = function() {
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

info.writeValidUrl = function() {
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

