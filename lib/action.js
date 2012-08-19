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
 * Object initializer
 *
 * @param {Object} set
 *
 * set:
 *
 *   - {String} jqueryPath  jquery path
 *   - {String} proxyPath  proxy path
 *   - {String} queuePath  queue path
 *   - {String} siteName  site name
 *   - {Object} act // TODO
 */

exports.init = function(set) {
  // settings
  createSet(set)
  createFile()
  // action
  // createAction()
}
/**
 * @param {Object} set
 *
 */

var settings = exports.settings = {}

function createSet(set) {
  settings._sites = join(__dirname, '../sites')
  settings.siteName = set.siteName
  settings.jqueryPath = set.jqueryPath
  settings.proxyPath = set.proxyPath
  settings.queuePath = set.queuePath
  settings.protoact = set.protoact
  settings.createDir()
}
/**
 * `Bot` actions
 */

var action = exports.action = {};

function createAction(set) {
  action.dldir = set.dldir;
  action.createBot();
}

/**
 * Inherit from `EventEmitter.prototype`.
 */

action.__proto__ = EventEmitter.prototype;

action.use = function(setting, val) {
  if (utils.isObject(setting)) {
    var client = this.client
    for (var key in client) {
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

action.createBot = function() {
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
 * Register prototypical action to apply to all loops => move to initializing time?
 *
 * @param {Object} action
 * @return {Object}
 * @api private
 */

function checkActionType(action) {
  if (!isAction(action)) return action;
  var fn = action.fn
    , url = action.url
    , cookie = action.cookie
    , _ref = []
    , obj = {}
  obj.fn = utils.isFunction(fn) ? fn : noop;
  if (0 != url.indexOf('http')) obj.url = 'http://' + url;
  else obj.url = url
  if (!utils.isArray(cookie)) {
    if (Object.keys(cookie).length != 0) {
      _ref = querystring.stringify(cookie, ';;').split(';;');
    };
    obj.cookie = _ref;
  }
  obj.withproxy = action.withproxy;
  obj.mode = action.mode;
  return obj
}

/**
 * Check member of Object
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isAction(obj) {
  if (obj.fn === undefined ||
      obj.cookie === undefined ||
      obj.url === undefined ||
      obj.withproxy === undefined ||
      obj.mode === undefined ||
      obj.url == '' ) { return false };
  return true;
}

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
