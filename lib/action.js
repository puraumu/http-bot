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
// var action = module.exports.action = {};
// bot.retry = set.retry || false; // => action

/**
 * Inherit from `EventEmitter.prototype`.
 */

action.__proto__ = EventEmitter.prototype;

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
 * User invoke this method when the actions have been end
 *
 * @api public
 */

action.next = function(obj) {
  this.emit('next');
  obj.fn = obj.fn || noop;
  this.client.trigger(obj.write, obj.fn);
  return this;

  var urls = file.urls
    , index = this.index
    , url = urls[index]
  if (url === undefined) return this.emit('end')
  this.protoact.url = url
  settings.setdldir(index)
  this.createBot();
  initHelper({url: url, index: index})
  this.index += 1
};

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
 * Add action to do next. The method delegate added action to `Bot`.
 *
 * @param {Object} action
 * @api public
 *
 * action:
 *
 *   - {Array} cookie
 *   - {String} url
 *   - {Boolean} withproxy
 *   - {Boolean} write
 *   - {Function} fn
 */

action.add = function(action) {
  var obj = checkActionType(action)
  if (obj === action) {
    // invalid action
    console.log('invalid action');
  } else {
    this.client.add(obj)
  }
};

/**
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
