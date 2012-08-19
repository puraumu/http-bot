var EventEmitter = require('events').EventEmitter
  , fs = require('fs')
  , http = require('http')
  , join = require('path').join
  , parse = require('url').parse
  , bot = require('./bot')
  , utils = require('./utils')
  , mkdirp = require('../node_modules/mkdirp')
  , querystring = require('querystring')

/**
 * `Bot` actions
 */

var action = module.exports = {};
// bot.retry = set.retry || false; // => action

/**
 * Inherit from `EventEmitter.prototype`.
 */

action.__proto__ = EventEmitter.prototype;

/**
 * Set options that `Bot` uses when request to server.
 *
 * @param {Object|String} setting
 * @param {Object} val (anything?)
 * @api public
 */

action.use = function(setting, val) {
  if (utils.isObject(setting)) {
    var client = this.client
    for (var key in setting) {
      client.set(key, setting[key])
    };
    return this;
  };

  if (1 == arguments.length) return this;
  var client = this.client;
  client.set(setting, val);
  return this;
}

/**
 * Add action to do next. The method delegate added action to `Bot`.
 *
 * @param {Object} obj
 *
 * obj:
 *
 *   - {Function} fn
 *   - {Boolean} write
 *
 * @api public
 */

action.next = function(obj) {
  this.emit('next');
  obj.fn = obj.fn || noop;
  this.client.trigger(obj.write, obj.fn);
  return this;

  initHelper({url: url, index: index})
};

/**
 * Emit `end` event.
 *
 * @api public
 */

action.end = function() {
  this.emit('end')
}

/**
 * Create `Bot`?
 *
 * TODO
 * dl dir?
 * how to loop => event, for,
 *   Users should determin when the actions are end. So `Bot` cannot kill itself.
 */

action.createBot = function(set) {
  var self = this
    , set = { dldir: this.dldir }
    , client = this.client = bot(set)
    , log = this.log = bot.log

  log.on('res', function() {
    // body...
  })

  log.on('req', function() {
    // body...
  })

  // client.add(this.protoact) // triger
}

/**
 * Emit `fail` event.
 * Save request and response to errors
 *
 * @param {Number} cwp
 * @api public
 * TODO
 * add req and res to errors
 */

action.failed = function(cwp) {
  var client = this.client
    , errors = this.errors
  errors.push(client.reqHeaders[cwp])
  errors.push(client.resHeaders[cwp])
};
