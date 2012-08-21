var EventEmitter = require('events').EventEmitter
  , utils = require('./utils')
  , fs = require('fs')
  , path = require('path')
  , join = path.join

/**
 * Expose `Logt`.
 */

exports = module.exports = Log;

/**
 * Noop
 */

function noop() {}

/**
 * TYPE: Model
 */

function Log() {
  // body...
  this.req = {};
  this.res = {};
  return new Log();
};

/**
 * Inherit from `EventEmitter.prototype`.
 */

Log.__proto__ = EventEmitter.prototype;

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

Log.prototype.keepHeader = function(type, obj) {
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
  return this.req.exist;
})

responseInterface.__defineGetter__('length', function() {
  return Number(this.headers['content-length']);
})

responseInterface.__defineGetter__('path', function() {
  return this.request.path;
})
