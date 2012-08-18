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

exports.start = function(set) {
  // settings
  createSet(set)
  createFile()
  // action
  createAction()
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
 * Create directories when initializing
 *
 * @api private
 * OK
 */

settings.createDir = function() {
  mkdirp(join(this._sites, this.siteName, 'dl'), function(err){
    if (err) console.log(err)
  })
};

/**
 * mkdir
 */

settings.setdldir = function(index) {
  var sites = this._sites
    , siteName = this.siteName
    , index = String(index)
    , dir = join(sites, siteName, 'dl', index);
  try {
    mkdirp.sync(dir)
  } catch (err) {
    try {
      var current = now();
      dir = join(sites, siteName, 'dl', index + '-' + current);
      mkdirp.sync(dir)
    } catch (err) {
      throw 'cannot create dl dir' + err
    }
  }
  this.dldir = dir
};

var file = exports.file = {}

/**
 * Create `file` Object
 *
 * @param {settings} set
 */

function createFile() {
  file.jquery = ''
  file.proxyList = []
  file.urls = []
  file.index = 0
  file.loadFiles()
}

/**
 * Read files to get proxys, download list and jQuery.
 *
 * @param {settings} set
 */

file.loadFiles = function() {
  var self = this
  fs.readFile(settings.jqueryPath, function(err, data) {
    if (err) throw err
    self.jquery = data.toString()
  })

  var queuePath = settings.queuePath
  if (queuePath == '') {
    if (!this._silent) console.log('no queues are loaded.');
  } else {
    var qstr = fs.readFileSync(queuePath).toString()
    if (qstr == '' && !this._silent) console.log('no queues are loaded.');
    else this.urls = JSON.parse(qstr)
  }

  var proxyPath = settings.proxyPath;
  if (proxyPath == '') {
    if (!this._silent) console.log('no proxys are loaded.')
  } else {
    var pstr = fs.readFileSync(proxyPath).toString()
    if (pstr == '') console.log('no proxys are loaded.');
    // if (pstr == '' && !this._silent) console.log('no proxys are loaded.');
    else this.proxyList = JSON.parse(pstr)
  }
};

/**
 * `Bot` actions
 */

var action = exports.action = {}

function createAction() {
  action.protoact = checkActionType(settings.protoact);
  action.index = 0
  action.next()
}

/**
 * Inherit from `EventEmitter.prototype`.
 */

action.__proto__ = EventEmitter.prototype;

/**
 * User invoke this method when the actions have been end
 *
 * @api public
 */

action.next = function() {
  this.emit('next')
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
    , set = {
      proxy: file.proxyList,
      retry: settings.retry,
      dldir: settings.dldir }
    , client = this.client = bot(set)
    , log = this.log = bot.log

  log.on('res', function() {
    // body...
  })

  log.on('req', function() {
    // body...
  })

  client.add(this.protoact) // triger
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

/**
 * helper
 *
 * dldir
 * title
 */

var helper = exports.helper = {}

function initHelper(set) {
  helper.url = set.url
  helper.title = ''
  helper.dldir = settings.dldir
  helper.index = set.index
  helper.bind = {title: helper.setTitle}
  helper.tryRequest(helper.call)
  action.on('next', function() {
    var newPath = join(settings._sites, settings.siteName, 'dl', helper.title)
    fs.rename(helper.dldir, newPath, function(err) {
      if (err) console.log('rename failed', err);
    })
  })
}

helper.call = function(res) {
  var fns = helper.bind
  for (var key in fns) {
    fns[key].call(helper, res)
  };
}

helper.hasNext = function() {
  return this.urls[this.index + 1] !== undefined
}

helper.next = function() {
  if (helper.hasNext()) {
    // go next
    this.index++
    this.tryRequest(this.next);
  };
  // end of this.urls
  this.emit('end', this.urls.filter(function(d) { return d.valid }))
}

/**
 * Check the response statusCode. If all urls was checked, start action
 *
 * @param {http.ClientResponse} res
 */

helper.checkUrl = function(res) {
  var urls = this.urls
    , index = this.index
  if (399 < res.statusCode) urls[index].valid = false;
  else urls[index].valid = true;
}

helper.setTitle = function(res) {
  var title = getTitle(res.body)
  if (title == null) title = now()
  this.title = title
}

function getTitle(body) {
  var title = ''
  if (body == '') {
    title = null
  } else {
    m = body.match(/<title>(.*)<\/title>/)
    if (m !== null) title = m[1]
    else title = null
  };
  return title
}

/**
 * Try to send request to the server
 *
 * @param {Function} fn
 * @api private
 */

helper.tryRequest = function(fn) {
  var url = this.url
  // var url = this.urls[this.index].data
  if (0 != url.indexOf('http')) url = 'http://' + url;
  var req = http.request(parse(url));
  req.end()
  req.on('error', function(err) { fn({statusCode: 400, body: 'notfound'}) })
  req.on('response', function(res) {
    res.body = ''
    var type = res.headers['content-type'] || '';
    if (type.indexOf('text/html') != 0) return fn(res)
    res.on('data', function(chunk) { res.body += chunk })
    res.once('end', function() { fn(res) })
  });
};

/**
 * Views
 * =====
 */

/**
 * Return time now as string.
 *
 * @api private
 * TODO
 * format
 */

function now() {
  var date = new Date
  return date.toJSON().replace(/T.*/, '-')
    + date.toLocaleTimeString().replace(/:/g, '-')
}

var info = {}
/**
 * View connection status
 *
 * @param {String} type
 * @param {Number} cwp
 * @api private
 */

info.logger = function(type, cwp) {
  var stout = '#' + String(cwp) + " "
  if (type == 'req') {
    var headers = this.client.reqHeaders[cwp]
      , exist = headers.exist ? '✔' :  '✖'
      , proxy = !!headers.proxy ? headers.proxy : '';
    stout += exist + " " + headers.method + " " + headers.url;
    if (proxy != '') stout += " >> " + proxy;
  };
  if ( type == 'res') {
    var headers = this.client.resHeaders[cwp]
      , statusCode = headers.statusCode
      , exist = '✔'
    if (399 < statusCode) exist = '✖';
    stout += exist + " " + statusCode + " " + headers.url;
  };
  console.log(stout);
  var name = join(this._sites, this.siteName, type + '.log')
    , file = "#" + String(cwp) + " " + type + "\n" + JSON.stringify(headers) + "\n\n"
  fs.appendFile(name, file, function(err){
    if (err) console.error('cannnot append', err);
  })
};

/**
 * Write errors
 *
 * @param {String} name
 * @api private
 */

info.writeErrors = function(name) {
  var errors = this.errors
    , file = JSON.stringify(errors);
  fs.writeFile(join(this._sites, this.siteName, name), file, function(err){
    if (err) console.log('writing errors', err, file);
  });
};

/**
 * Write proxyList of current status for later use
 *
 * @api private
 * TODO
 * no need? because accessing proxy list inside `Parse` is hard to do.
 */

info.writeProxy = function() {
  var proxyList = this.proxyList
    , name = join(this._sites, this.siteName, 'proxy.json')
  proxyList.map(function(d){
    d.useful = true
    if (3 < d.fail) d.useful = false
    return d
  })
  fs.writeFile(name, JSON.stringify(proxyList), function(err){
    if (err) console.log('cannnot write proxyList', err);
  })
};

/**
 * Write files
 * OK
 */

info.writeValidUrl = function() {
  var dir = join(this._sites, this.siteName)
    urls = this.urls.filter(function(d) {
      return !d.valid
    })
  if (urls.length == 0) return
  console.log('followings are invalid URL:');
  console.log(JSON.stringify(urls));

    // , valid = this.valid
    // , errors = this.errors
  // if (valid.length == 0 && errors.length == 0) return
  // console.log('followings are invalid URL:');
  // console.log(JSON.stringify(errors));
  // fs.writeFileSync(join(dir, 'valid.json'), JSON.stringify(valid))
  // fs.writeFileSync(join(dir, 'errors.json'), JSON.stringify(errors))
};

