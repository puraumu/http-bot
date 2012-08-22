
/**
 * Module dependencies.
 */

var EventEmitter = require('events').EventEmitter
  , http = require('http')
  , Action = require('./action')
  , Options = require('./options')
  , utils = require('./utils')
  , View = require('./view')
  , Log = require('./log')

/**
 * Expose `robot`.
 */

exports = module.exports = Robot;

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

function Robot(set) {
  set = set || {};
  // body...
  this.action = new Action();
  this.log = this.action.log;
  this.view = new View();
};

/**
 * Create `robot`.
 */

function createRobot() {
  utils.merge(robot, action)
  return robot;
};

/**
 * Display request results.
 *
 * @api private
 */

Robot.prototype.display = function() {
  var view = this.view
    , log = this.log

  if (view.silent) return;
  if (view.request) {
    log.on('req', function() {
      view.displayRequest(this.req, this.url)
    });
  };
  if (view.response) {
    log.on('res', function() {
      view.displayResponse(this.res, this.url)
    });
  };
  if (view.warning) {
    log.on('notfound', function() {
      view.displayRequest(this.req, this.url)
    });
  };
};

/**
 * Reset event listener.
 */

Robot.prototype.reset = function() {
  this.log.removeAllListeners('req')
  this.log.removeAllListeners('res')
  this.log.removeAllListeners('notfound')
};

/**
 * Set User function to `Action`
 *
 * @param {String} name
 * @param {Function} fn
 * @return {Robot}
 * @api public
 */

Robot.prototype.do = function(name, fn) {
  this.action.do(name, fn);
  return this;
}

/**
 * Set User function to be invoked when request gets error event.`
 *
 * @param {Function} fn
 * @return {Robot}
 * @api public
 */

Robot.prototype.error = function(fn) {
  this.action.error(fn);
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

Robot.prototype.set = function(setting, val) {
  this.action.set(setting, val);
  return this;
}

/**
 * Prepare for sending request. Save action name.
 *
 * Begin to do the action.
 *
 */

Robot.prototype.start = function(name, write) {
  override.call(this);
  this.action.trigger(name, write);
  return this;
};

function override() {
  this.display();
  this.start = function(name, write) {
    this.action.trigger(name, write);
    return this;
  };
};

/**
 * Change `View`
 */

Robot.prototype.enable = function(setting) {
  return this.view.enable(setting);
};

Robot.prototype.disable = function(setting) {
  return this.view.disable(setting);
};

