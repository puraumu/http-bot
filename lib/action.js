/**
 * Module dependencies.
 */

var EventEmitter = require('events').EventEmitter
  , http = require('http')
  , request = http.request
  , Options = require('./options')
  , utils = require('./utils')
  , Log = require('./log')
  , fs = require('fs')
  , path = require('path')
  , join = path.join
  , basename = path.basename

/**
 * Expose `Action`.
 */

 exports = module.exports = Action;

/**
 * Noop
 */

function noop() {}

/**
 * TYPE: Controller, Operator
 */

/**
 * Action prototype
 *
 * @param {Object} setting
 *
 * set:
 *
 *   - proxy {Array}
 *   - retry {Boolean}
 *
 * Event:
 *
 *   - error emit it when parse failed
 */

function Action(setting) {
  setting = setting || {};
  this._error = noop;
  this.actions = setting.actions || {};
  this.options = new Options();
  this.log = new Log();
};

/**
 * Inherit from `EventEmitter.prototype`.
 */

Action.prototype.__proto__ = EventEmitter.prototype;

/**
 * Set User function to `Action`
 *
 * @param {String} name
 * @param {Function} fn
 * @api public
 */

Action.prototype.do = function(name, fn) {
  if (arguments.length == 1)  {
    if ('function' == typeof name && !name.name) {
      console.log('Sorry. Cannot determine function name.');
      console.log('Use "function NAME(){}"'
          + ' or "action.do(\'NAME\', function(){})" instead.');
      return false;
    };
    fn = name;
    name = name.name;
  };
  this.actions[name] = fn;
}

/**
 * Set User function to be invoked when request gets error event.`
 *
 * @param {Function} fn
 * @api public
 */

Action.prototype.error = function(fn) {
  if ('function' != typeof fn) fn = noop;
  this._error = fn;
  return this;
};

// ===

/**
 * Emit `fail` event.
 * Save request and response to errors
 *
 * @param {Number} cwp
 * @api public
 * TODO
 * add req and res to errors
 */

Action.prototype.failed = function(cwp) {
  var client = this.client
    , errors = this.errors
  errors.push(client.reqHeaders[cwp])
  errors.push(client.resHeaders[cwp])
};

/**
 * Emit `end` event.
 *
 * @api public
 */

Action.prototype.end = function() {
  this.emit('end')
}

/**
 * Change download directory
 *
 * @param {String} dir
 * @api public
 *
 * delegate `helper` to mkdirp?
 */

Action.prototype.chdir = function(dir) {
  if ('string' != typeof dir) return this;
  // body...
  // this.client.dldir = dldir;
  this.emit('chdir', dldir);
  return this;
}

// ===

/**
 * Set options which `Action` uses when requests to server.
 *
 * @param {Object|String} setting
 * @param {Object} val (anything?)
 * @return {Action}
 * @api public
 */

Action.prototype.set = function(setting, val) {
  var options = this.options;
  if (utils.isObject(setting)) {
    for (var key in setting) {
      options.set(key, setting[key])
    };
    return this;
  };

  if (1 == arguments.length) return this;
  options.set(setting, val)
  return this;
}

/**
 * Prepare for sending request. Save action name.
 *
 * Begin to do the action.
 *
 * TODO
 * arguments should be function name?
 */

Action.prototype.trigger = function(name) {
  var log = this.log;
  if (!name) return log.emit('end');
  var actions = this.actions
    , fn = actions[name];
  if ('function' != typeof fn) return console.log('cannot find the function!');
  log.emit('next');
  return this.sendRequest(fn);
};

/**
 * Issue request
 *
 * @param {Function} fn
 *
 * return:
 *
 *   - {http.ClientResponse}
 *   - {options}
 */

Action.prototype.sendRequest = function(fn) {
  var self = this
    , options = this.options
    , log = this.log
    , req = request(options)
    , url = options.url

  req.end();

  req.on('error', function(err) {
    log.keepHeader('notfound', req);
    return self._error(log.req, options, self.trigger.bind(self));
  });

  req.on('response', function(res) {
    log.url = url;
    log.start = new Date;
    log.keepHeader('req', req);
    res.body = ''
    res.on('data', function(chunk) {
      res.body += chunk
    })
    res.on('end', function() {
      log.url = url;
      log.end = new Date;
      log.duration = new Date - log.start;
      log.keepHeader('res', res);
      // if (obj.withproxy && !self.evalProxy(log.resI) && self.retry) return self.request(obj)
      return fn(log.res, options, self.trigger.bind(self));
      // return fn(res.body, log.res); // old return
    })
  });
};

