var EventEmitter = require('events').EventEmitter
  , request = require('../node_modules/request')
  , history = require('../node_modules/history')
  , utils = require('./utils')
  , fs = require('fs')
  , join = require('path').join
  , basename = require('path').basename
  , extname = require('path').extname
  , querystring = require('querystring')
  , mkdirp = require('../node_modules/mkdirp')

/**
 * Expose `Info`.
 */

 module.exports = Parser;

/**
 * Noop
 */

function noop() {}

/**
 * TYPE: Controller, Operator
 */

/**
 * Initialize `Parser`.
 *
 * @param {Object} set
 *
 * set:
 *
 *   - url {String}
 *   - proxy {Array}
 *   - jquery {String}
 *   - name {String}
 *   - retry {Boolean}
 *
 * Event:
 *
 *   - error emit it when parse failed
 */

function Parser(set) {
  // DATA
  // TODO check names
  // this.jquery = set.jquery;
  // this._url = set.url || now(); // first url to use

  // this.title = '';
  // this.href = ''; // url, top url
  // this._sites = join(__dirname, '../sites');
  // this.siteName = set.name;


  // inner, for request
  var self = this
    , actions = history();
  this.proxyList = set.proxy;
  this._proxy = -1;
  this.reqHeaders = [];
  this.resHeaders = [];
  this.retry = set.retry;
  this.actions = actions;

  // error, parse error
  this.errors = [];
  this.on('error', function(cwp){
    self.errors.push(self.reqHeaders[cwp]);
    self.errors.push(self.resHeaders[cwp]);
  });
  this.on('notfound', function(redirects, cwp){
    var header = self.reqHeaders[cwp];
    header['redirects'] = redirects;
    self.errors.push(header);
  });

  // event
  actions.on('next', function(obj, n){
    self.request(obj, n);
  });
  // process.once('uncaughtException', function(){
    // self.writeErrors('errors.json')
    // self.writeProxy()
  // })
  // process.on('exit', function(){
    // self.writeErrors('errors.json')
    // self.writeProxy()
  // })
}

/**
 * Inherit from `EventEmitter.prototype`.
 */

Parser.prototype.__proto__ = EventEmitter.prototype;

/**
 * Issue request with params
 *
 * @param {Object} obj
 * @param {Number} cwp
 * @return {Object}
 * @api private
 *
 * obj:
 *
 *   - {Function} fn
 *   - {Array} cookie
 *   - {String} url
 *   - {Boolean} withproxy
 *   - {String} mode: get, write
 *
 * return:
 *
 *   - body res.body
 *   - headers res.headers
 *   - statusCode res.statusCode
 */

Parser.prototype.request = function(obj, cwp) {
  var self = this
    , url = obj.url
    , cookie = obj.cookie
    , jar = request.jar()
    , mode = obj.mode
    , options = {};
  if (obj.withproxy) {
    var proxy = this.readProxy(true);
    if (0 != proxy.indexOf('http')) proxy = 'http://' + proxy;
    options.proxy = proxy;
  };
  for (var i = 0, len = cookie.length; i < len; i++) {
    var item = cookie[i];
    jar.add(request.cookie(item));
  };
  options.url = url;
  options.jar = jar;
  // header

  if (mode == 'write') return write(options);
  if (mode == 'get') return getreq(options);
  if (mode == 'nothing') return obj.fn(obj);

  function getreq(options) {
    request(options, function(err, res){
      self.keepHeader(this, cwp);
      if (!err) self.logger('req', cwp);
      if (err) {
        self.reqHeaders[cwp]['exist'] = false;
        self.logger('req', cwp);
        self.emit('notfound', this.redirects, cwp);
        return obj.fn(null, url, cwp);
      } else {
        self.keepHeader(res, cwp);
        self.logger('res', cwp);
        if (obj.withproxy && !self.evalProxy(cwp) && self.retry) return self.request(obj, cwp)
        return obj.fn(res.body, url, cwp);
      };
    });
  }

  // TODO
  // emit
  function write(options) {
    var name = escape(basename(url))
      , dir = self._outDir
      , full = join(dir, name)
      , ext = extname(url)
    if (!dir) {
      dir = self._outDir = self.dldir()
      full = join(dir, name)
    }
    if (ext != '.html' && ext != '.htm' && ext != '') options.encoding = null
    request(options, function(err, res){
      self.keepHeader(this, cwp);
      if (!err) self.logger('req', cwp);
      if (err) {
        self.reqHeaders[cwp]['exist'] = false;
        self.logger('req', cwp);
        self.emit('notfound', this.redirects, cwp);
      } else {
        self.keepHeader(res, cwp);
        self.logger('res', cwp);
        if (obj.withproxy && !self.evalProxy(cwp) && self.retry) return self.request(obj, cwp)
        fs.writeFile(full, res.body, function(err){
          if (err) console.log('cannot write file. #' + String(cwp) + ' ' + full, err);
        });
      };
    })
  }
};

/**
 * Keep headers of actions
 *
 * @param {Request|Response} obj
 * @param {Number} cwp
 * @api private
 */

Parser.prototype.keepHeader = function(obj, cwp) {
  if (obj.request === undefined) {
    // req obj
    var proxy;
    if (!!obj.proxy) proxy = obj.proxy.href;
    this.reqHeaders[cwp] = {
      url: obj.uri.href,
      method: obj.method,
      exist: true,
      cookie: obj.headers.cookie,
      proxy: proxy,
      redirects: obj.redirects,
      host: obj.host }
  } else {
    // res obj
    this.resHeaders[cwp] = {
      url: obj.request.uri.href,
      statusCode: obj.statusCode,
      // type: obj.headers['content-type'],
      // size: obj.headers['content-length'],
      headers: obj.headers
    }
  };

};

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
 * @param {Boolean} random
 * @return {String}
 * @api private
 * TODO
 * shuffle, reset?
 */

Parser.prototype.readProxy = function(random) {
  var proxy = ''
    , proxyList = this.proxyList;
  if (random) {
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

Parser.prototype.evalProxy = function(cwp) {
  var statusCode = this.resHeaders[cwp]['statusCode']
    , index = this._proxy
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

