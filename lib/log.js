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
 * TYPE: Model
 */

function Log() {
  // body...
  this.req = {};
  this.res = {};
};

/**
 * Inherit from `EventEmitter.prototype`.
 */

Log.prototype.__proto__ = EventEmitter.prototype;

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
  switch (type) {
    case 'req':
      // req obj
      obj.exist = true;
      this.req = obj;
      this.emit(type)
      // this.req = extend.call(this.req, obj);
      break;
    case 'res':
      // res obj
      this.res = extend.call(responseInterface, obj)
      this.emit(type)
      break;
    case 'notfound':
      obj.exist = false;
      this.req = obj;
      this.emit(type)
      break;
    default:
      break;
  };
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

