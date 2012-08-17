var EventEmitter = require('events').EventEmitter
  , request = require('../node_modules/request')
  , history = require('../node_modules/history')
  , utils = require('./utils')
  , fs = require('fs')
  , join = require('path').join
  , basename = require('path').basename
  , extname = require('path').extname
  , querystring = require('querystring')

/**
 * Expose `Bot`.
 */

 exports = module.exports = createBot;

/**
 * Noop
 */

function noop() {}

/**
 * Initialize `Bot`.
 *
 * @param {Object} set
 *
 * set:
 *
 *   - proxy {Array}
 *   - retry {Boolean}
 *   - dldir {String} for writing
 *
 * Event:
 *
 *   - error emit it when parse failed
 */

function createBot(set) {
  var bot = new Bot()
  bot.proxyList = set.proxy;
  bot.retry = set.retry || false;
  bot.dldir = set.dldir;
  // event
  bot.actions.on('add', function(obj, n){
    bot.request(obj, n);
  });

  log.req = []
  log.res = []
  log.reqI = -1
  log.resI = -1
  return bot
}

/**
 * TYPE: Model
 */

var log = exports.log = {}

/**
 * Inherit from `EventEmitter.prototype`.
 */

log.__proto__ = EventEmitter.prototype;

/**
 * Keep headers of actions
 *
 * @param {Request|Response} obj
 * @param {Number} cwp
 * @api private
 */

log.keepHeader = function(obj) {
  var type = ''
  if (obj.request === undefined) {
    // req obj
    var proxy;
    if (!!obj.proxy) proxy = obj.proxy.href;
    log.req.push({
      url: obj.uri.href,
      method: obj.method,
      exist: true,
      cookie: obj.headers.cookie,
      proxy: proxy,
      redirects: obj.redirects,
      host: obj.host })
    log.reqI++
    type = 'req'
  } else {
    // res obj
    log.res.push({
      url: obj.request.uri.href,
      statusCode: obj.statusCode,
      headers: obj.headers })
    log.resI++
    type = 'res'
  };
  log.emit(type)
}

/**
 * TYPE: Controller, Operator
 */

function Bot() {
  // inner, for request
  this.actions = history();
  this.proxyList = [];
  this._proxy = -1;
}

/**
 * Inherit from `EventEmitter.prototype`.
 */

Bot.prototype.__proto__ = EventEmitter.prototype;

/**
 * Add an action that `Bot` will do
 */

Bot.prototype.add = function(action) {
  this.actions.push(action)
  this.request(action)
};

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
 *   - body res.body || null
 *   - url
 *   - cwp
 */

Bot.prototype.request = function(obj) {
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
      log.keepHeader(this);
      if (err) {
        log.req[log.reqI]['exist'] = false;
        log.emit('notfound', this.redirects);
        return obj.fn(null, url, log.reqI);
      } else {
        log.keepHeader(res);
        if (obj.withproxy && !self.evalProxy(log.resI) && self.retry) return self.request(obj)
        return obj.fn(res.body, url, log.resI);
      };
    });
  }

  function write(options) {
    var name = utils.escape(basename(url))
      , dir = self.dldir
      , full = join(dir, name)
      , ext = extname(url)
    if (ext != '.html' && ext != '.htm' && ext != '') options.encoding = null
    request(options, function(err, res){
      log.keepHeader(this);
      if (err) {
        log.req[log.reqI]['exist'] = false;
        log.emit('notfound', this.redirects);
      } else {
        log.keepHeader(res);
        if (obj.withproxy && !self.evalProxy(log.resI) && self.retry) return self.request(obj)
        fs.writeFile(full, res.body, function(err){
          if (err) console.log('cannot write file. #' + String(log.resI) + ' ' + full, err);
        });
      };
    })
  }
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

Bot.prototype.readProxy = function(random) {
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

Bot.prototype.evalProxy = function(cwp) {
  var statusCode = log.res[cwp]['statusCode']
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

