
/**
 * Module dependencies.
 */

var http = require('http')
  , Action = require('./action')
  , Options = require('./options')
  , utils = require('./utils')
  , View = require('./view')
  , Log = require('./log')

/**
 * Expose `robot`.
 */

exports = module.exports = {};

/**
 * Expose internals.
 */

exports.Log = Log;
exports.View = View;
exports.Action = Action;
exports.Options = Options;

/**
 * Initialize `Robot`
 */

var action = new Action();

var log = action.log;

var view = new View();

/**
 * Display request results.
 *
 * @api public
 */

exports.display = function() {
  if (view.silent) return this;
  if (view.request) {
    log.on('req', function(req) {
      view.displayRequest(req, req.url)
    });
  };
  if (view.response) {
    log.on('res', function(res, duration) {
      view.displayResponse(res, res.url, duration)
    });
  };
  if (view.warning) {
    log.on('notfound', function(req) {
      view.displayRequest(req, req.url)
    });
  };
  return this;
};

/**
 * Reset event listener.
 */

exports.reset = function() {
  log.removeAllListeners('req')
  log.removeAllListeners('res')
  log.removeAllListeners('notfound')
  return this;
};
/**
 * Set User function to `Action`
 *
 * @param {String} name
 * @param {Function} fn
 * @return {Robot}
 * @api public
 */

exports.do = function(name, fn) {
  action.do(name, fn);
  return this;
}
/**
 * Set User function to be invoked when request gets error event.`
 *
 * @param {Function} fn
 * @return {Robot}
 * @api public
 */

exports.error = function(fn) {
  action.error(fn);
  return this;
};
/**
 * Set options which `Action` uses when requests to server.
 *
 * @param {Object|String} setting
 * @param {Object} val (anything?)
 * @return {Robot}
 * @api public
 */

exports.set = function(setting, val) {
  action.set(setting, val);
  return this;
}
/**
 * Prepare for sending request. Save action name.
 *
 * Begin to do the action.
 *
 */

exports.start = function(name) {
  override.call(exports);
  action.trigger(name);
  return this;
};

function override() {
  this.display();
  this.start = function(name) {
    action.trigger(name);
    return this;
  };
};

/**
 * Change `View`
 */

exports.enable = function(setting) {
  return view.enable(setting);
};

exports.disable = function(setting) {
  return view.disable(setting);
};

