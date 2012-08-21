var EventEmitter = require('events').EventEmitter
  , request = require('../node_modules/request')
  , options = require('./options')
  , utils = require('./utils')
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

function Action(set) {
  // body...
  // inner, for request
  // this.proxyList = [];
  // this._proxy = -1;
  this.dldir = set.dldir || '';
  this.options = options();
  this.actions = set.actions || {};
};

/**
 * Inherit from `EventEmitter.prototype`.
 */

Action.prototype.__proto__ = EventEmitter.prototype;

// ===

/**
 * Create `Bot`?
 *
 * TODO
 * TODO remove
 * dl dir?
 * how to loop => event, for,
 *   Users should determine when the actions are end. So `Bot` cannot kill itself.
 */

Action.prototype.createBot = function(setting) {
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
 * Set User function to `Bot`
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
      options[key] = setting[key];
    };
    return this;
  };

  if (1 == arguments.length) return this;
  options[setting] = val;
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

Action.prototype.trigger = function(write, name) {
  var fn = this.actions[name];
  if ('function' != typeof fn) return console.log('cannot find the function!');
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

Action.prototype.sendRequest = function(write, fn) {
  var self = this
    , options = this.options
    , log = this.log
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

