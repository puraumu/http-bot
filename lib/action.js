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
 * Create `Bot`?
 *
 * TODO
 * dl dir?
 * how to loop => event, for,
 *   Users should determine when the actions are end. So `Bot` cannot kill itself.
 */

action.createBot = function(setting) {
  var self = this
    , set = { dldir: setting.dldir, actions: setting.actions }
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
 * Set User action to `Bot`
 *
 * @param {String} name
 * @param {Function} fn
 * @api public
 */

action.do = function(name, fn) {
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
  this.client.actions[name] = fn;
}

/**
 * Begin to do the action.
 *
 * @param {String} name
 * @api public
 */

action.start = function(name) {
  this.client.trigger(false, name);
}

/**
 * Set options which `Bot` uses when requests to server.
 *
 * @param {Object|String} setting
 * @param {Object} val (anything?)
 * @return {action}
 * @api public
 */

action.set = function(setting, val) {
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
 * TODO
 * remove
 */

action.next = function(obj) {
  this.emit('next');
  obj.fn = obj.fn || noop;
  this.client.trigger(obj.write, obj.fn);
  return this;

  initHelper({url: url, index: index})
};

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

/**
 * Emit `end` event.
 *
 * @api public
 */

action.end = function() {
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

action.chdir = function(dir) {
  if ('string' != typeof dir) return this;
  // body...
  // this.client.dldir = dldir;
  this.emit('chdir', dldir);
  return this;
}

