var EventEmitter = require('events').EventEmitter
  , request = require('../node_modules/request')
  , utils = require('./utils')
  , fs = require('fs')
  , path = require('path')
  , join = path.join
  , basename = path.basename
  , extname = path.extname
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
  // this.actions.push(action)
  var options = this.setHeaders(action)
  this.request(options, false, action.fn)
  // this.request(options, action.write, action.fn)
};

/**
 * Set headers for request
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 *
 * obj:
 *
 *   - {Array} cookie
 *   - {String} url
 *   - {Boolean} withproxy
 *
 */

Bot.prototype.setHeaders = function(obj) {
  var self = this
    , url = obj.url
    , cookie = obj.cookie
    , jar = request.jar()
    , ext = extname(url)
    , options = {};
  if (obj.withproxy) {
    var proxy = this.readProxy(true);
    if (0 != proxy.indexOf('http')) proxy = 'http://' + proxy;
    options.proxy = proxy;
  };
  // if (ext != '.html' && ext != '.htm' && ext != '') options.encoding = null
  for (var i = 0, len = cookie.length; i < len; i++) {
    var item = cookie[i];
    jar.add(request.cookie(item));
  };
  options.url = url;
  options.jar = jar;
  return options
};

/**
 * Issue request
 *
 * @param {options} options
 * @param, {Boolean} write
 * @param {Function} fn
 *
 * return:
 *
 *   - body res.body || null
 *   - url
 *   - cwp
 */

Bot.prototype.request = function(options, write, fn) {
  var req = request(options)
    , url = options.url
  req.on('request', function() {
    log.keepHeader(req);
  })
  req.on('error', function(err) {
    log.req[log.reqI]['exist'] = false;
    fn(null, url, log.reqI)
  })

  if (write) {
  var name = utils.escape(basename(url))
    , full = join(this.dldir, name)
    req.pipe(fs.createWriteStream(full))
  }

  req.on('response', function(res) {
    log.keepHeader(res);
    res.body = ''
    res.on('data', function(chunk) {
      res.body += chunk
    })
    res.on('end', function() {
      // if (obj.withproxy && !self.evalProxy(log.resI) && self.retry) return self.request(obj)
      fn(res.body, url, log.resI);
    })
  })
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

