var EventEmitter = require('events').EventEmitter
  , request = require('../node_modules/request')
  , options = require('./options')
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
  bot.options = options();
  bot.actions = set.actions;

  log.req = {};
  log.res = {};
  return bot;
}

/**
 * TYPE: Model
 */

var log = exports.log = {};

/**
 * Inherit from `EventEmitter.prototype`.
 */

log.__proto__ = EventEmitter.prototype;

/**
 * Extend Object using `call()` method
 *
 * @param {Object} proto
 * @return {Object}
 * @api private
 */

function extend(proto) {
  this.__proto__ = proto
  return this;
};

/**
 * Keep request or response headers of http
 *
 * @param {String} type
 * @param {Object} obj
 * @api private
 */

log.keepHeader = function(type, obj) {
  if (type == 'req') {
    // req obj
    obj.exist = true;
    this.req = obj;
    // this.req = extend.call(this.req, obj);
  }
  if (type == 'res') {
    // res obj
    this.res = extend.call(responseInterface, obj)
  };
  this.emit(type)
}

/**
 * Return response header.
 *
 * @param {String} name
 * @return {String}
 * @api public
 */

var responseInterface = {};

responseInterface.__defineGetter__('head', function() {
  return this;
})

responseInterface.__defineGetter__('status', function() {
  return this.statusCode;
})

responseInterface.__defineGetter__('type', function() {
  return this.headers['content-type'];
})

responseInterface.__defineGetter__('html', function() {
  return this.headers['content-type'].indexOf('text/html') == 0;
})

responseInterface.__defineGetter__('exist', function() {
  return log.req.exist;
})

responseInterface.__defineGetter__('length', function() {
  return Number(this.headers['content-length']);
})

responseInterface.__defineGetter__('path', function() {
  return this.request.path;
})

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

// Bot.prototype.__proto__ = EventEmitter.prototype;

/**
 * Set the options to be useed by `request`.
 *
 * @param {String} setting
 * @param {Object} val
 * @api public
 */

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

/**
 * Prepare for sending request. Save action name.
 *
 * TODO
 * arguments should be function name?
 */

Bot.prototype.trigger = function(write, name) {
  var fn = this.actions[name];
  if ('function' != typeof fn) return console.log('this is not function!');
  return this.sendRequest(write, fn);
};

/**
 * Issue request
 *
 * @param {options} options
 * @param {Boolean} write
 * @param {Function} fn
 *
 * return:
 *
 *   - {http.ClientResponse}
 *   - {options}
 */

Bot.prototype.sendRequest = function(write, fn) {
  var self = this
    , options = this.options
    , req = request(options)
    , url = options.url

  req.on('request', function() {
    log.start = new Date;
    log.keepHeader('req', req);
  });

  req.on('error', function(err) {
    log.req.exist = false;
    log.emit('notfound');
    return fn(log.req, options, next);
  });

  if (write) {
  var dldir = this.dldir
    , name = utils.escape(basename(url))
    , full = join(dldir, name);
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
      return fn(log.res, options, next);
      // return fn(res.body, log.res); // old return
    })
  });

  function next(name) {
    if (!name) return;
    log.emit('next');
    return self.trigger(self.write, name);
  };
};

