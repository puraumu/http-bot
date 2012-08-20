var EventEmitter = require('events').EventEmitter
  , request = require('../node_modules/request')
  , utils = require('./utils')
  , fs = require('fs')
  , path = require('path')
  , join = path.join
  , basename = path.basename
  , extname = path.extname

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
  // bot.proxyList = set.proxy;// => req
  bot.dldir = set.dldir;
  bot.options = {};

  log.req = {};
  log.res = {};
  return bot;
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

log.keepHeader = function(type, obj) {
  if (type == 'req') {
    // req obj
    obj.exist = true;
    log.req = obj;
  }
  if (type == 'res') {
    // res obj
    log.res = obj
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

Bot.prototype.set = function(setting, val) {
  if (1 == arguments.length) {
    if (this.options.hasOwnProperty(setting)) {
      return this.options[setting];
    }
  } else {
    this.options[setting] = val;
    return this;
  }
};

Bot.prototype.trigger = function(obj) {
  return this.request(obj.write, obj.fn);
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

Bot.prototype.request = function(write, fn) {
  var options = this.options
    , req = request(options)
    , url = options.url
  req.on('request', function() {
    log.start = new Date;
    log.keepHeader('req', req);
  });
  req.on('error', function(err) {
    log.req.exist = false;
    log.emit('notfound');
    return fn(null, url);
  });

  if (write) {
  var name = utils.escape(basename(url))
    , full = join(this.dldir, name);
    req.pipe(fs.createWriteStream(full));
  };

  req.on('response', function(res) {
    res.body = ''
    res.on('data', function(chunk) {
      res.body += chunk
    })
    res.on('end', function() {
      log.end = new Date;
      log.duration = new Date - log.start;
      log.keepHeader('res', res);
      // if (obj.withproxy && !self.evalProxy(log.resI) && self.retry) return self.request(obj)
      return fn(res.body, url);
    })
  })
};

