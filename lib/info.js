var join = require('path').join
  , fs = require('fs')
  , http = require('http')
  , parse = require('url').parse
  , bot = require('./bot')
  , utils = require('./utils')
  , mkdirp = require('../node_modules/mkdirp')
  , history = require('../node_modules/history')
  , querystring = require('querystring')
  , basename = require('path').basename
  , extname = require('path').extname

/**
 * Object initializer
 *
 * @param {Object} set
 */

exports.init = function(set) {
  // settings
  createSet(set)
  // action
  // createAction(set)
  createFile()
  // info
  createInfo()
}

var file = exports.file = {}

/**
 * Create `file` Object
 *
 * @param {settings} set
 */

function createFile() {
  file.jquery = ''
  file.proxyList = []
  file.queues = []
  file.loadFiles()
}

/**
 * Read files to get proxys, download list and jQuery.
 *
 * @param {settings} set
 */

file.loadFiles = function() {
  this.jquery = fs.readFileSync(settings.jqueryPath).toString()
  var proxyPath = settings.proxyPath;
  if (proxyPath == '') {
    console.log('no proxys are loaded.');
  } else {
    var pstr = fs.readFileSync(proxyPath).toString()
    if (pstr == '') console.log('no proxys are loaded.');
    else this.proxyList = JSON.parse(pstr)
  }
  var qstr = fs.readFileSync(settings.queuePath).toString()
  if (qstr == '') {
    console.log('no queues are loaded.');
    // TODO
    // this.environment([]);
  } else {
    var queue = JSON.parse(qstr)
    this.urls = queue.map(function(d) {
      return {data: d, valid: true}
    });
    // TODO
    // this.i_url = 0;
  }
};

/**
 * @param {Object} set
 *
 * set:
 *
 *   - {String} jqueryPath  jquery path
 *   - {String} proxyPath  proxy path
 *   - {String} queuePath  queue path
 *   - {String} siteName  site name
 *   - {Object} protoact // TODO
 */

var settings = exports.settings = {}

function createSet(set) {
  settings.title = ''
  settings.href = ''
  settings._sites = join(__dirname, '../sites')
  settings.siteName = set.siteName
  settings.jqueryPath = set.jqueryPath
  settings.proxyPath = set.proxyPath
  settings.queuePath = set.queuePath
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
 * Expose `Info`.
 */

 var info = exports.info = {}

/**
 * Models
 *
 */

// TODO
// if (set.mode != 'test') {
  // process.once('uncaughtException', function(){
    // info.write()
  // })
  // process.on('exit', function(){
    // info.write()
  // })
// };

function createInfo () {
  info.index = 0;
  info.errors = []; // => data: url, valid: true
  info.valid = [];
}

/**
 * Check the response statusCode. If all urls was checked, invoke environment
 *
 * @param {http.ClientResponse} res
 */

info.checkUrl = function(res) {
  var urls = file.urls
    , n = this.index
  if (399 < res.statusCode) file.urls[n].valid = false;
  else file.urls[n].valid = true;

  if (res.body == '') {
    file.urls[n].title = now()
  } else {
    var title = res.body.match(/<title>(.*)<\/title>/)
    if (title !== null) file.urls[n].title = title[1]
    else file.urls[n].title = now()
  };
  n += 1
  // TODO
  if (n == 0) return // no such url in urls
  if (urls[n] === undefined) {
    // end of this.urls
    var valid = urls.filter(function(d) { return d.valid })
      return;
    // return this.environment(valid)
  };
  // go next
  this.index = n;
  this.tryRequest();
};

/**
 * Try to send request to the server
 *
 * @api private
 */

info.tryRequest = function() {
  var self = this
    , url = file.urls[this.index].data
  if (0 != url.indexOf('http')) url = 'http://' + url;
  var req = http.request(parse(url));
  req.end()
  req.on('error', function(err) { self.checkUrl({statusCode: 400, body: 'notfound'}) });
  req.on('response', function(res) {
    res.body = ''
    var type = res.headers['content-type'] || '';
    if (type.indexOf('text/html') != 0) return self.checkUrl(res)
    res.on('data', function(chunk) { res.body += chunk })
    res.once('end', function() { self.checkUrl(res) })
  });
};

// === ===

var action = {}

function createAction(set) {
  action.protoact = checkActionType(set.protoact);
}

/**
 * For `Bot` environment

action.environment() = function(valid) {
  // info.retry = retry , retry = true
  var self = this
    , remain = this.remain = history(valid)
  remain.on('next', function(d, i) {
    self.protoact.url = d.data
    self.title = d.title
    self.createBot(protoact)
  })
  var url = remain.now()
  this.protoact.url = url.data
  this.title = url.title
  this.createBot(protoact);
}

 */
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
  var client = this.client = bot(info)

  client.on('request', function(cwp) { // client sent request
    self.logger('req', cwp)
  })

  client.on('notfound', function(redirects, cwp) { // client cannnot find the page
    self.failed(cwp)
  })

  client.on('response', function(cwp) { // client got response
    self.logger('res', cwp)
  })

  client.on('end', function() { // all actions have been finished
  })
  this.pushAct(this.protoact) // triger
}

/**
 * Interface
 * =========
 */

/**
 * User invoke this method when the actions have been end
 *
 * @api public
 */

action.end = function() {
  this.remain.next()
};

/**
 * Add action to do next. The method delegate added action to `Bot`.
 *
 * @param {Object} action
 * @api public
 *
 * action:
 *
 *   - {Function} fn
 *   - {String} url
 *   - {Object} cookie
 *   - {Boolean} withproxy
 *   - {String} mode: get, write
 */

action.add = function(action) {
  var obj = checkActionType(action)
  if (obj === action) {
    // invalid action
    console.log('invalid action');
  } else {
    var client = this.client
    client.actions.push(obj)
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
    , re = new RegExp(':', 'g')
  return date.toJSON().replace(/T.*/, '-') + date.toLocaleTimeString().replace(re, '-')
}

/**
 * mkdir
 *
 * TODO
 * title
 */

info.dldir = function() {
  var sites = this._sites
    , siteName = this.siteName
    , title = utils.escape(this.title)
    // , title = utils.escape(this.title)
  // if (title == '') title = this.title = now();
  var dir = join(sites, siteName, 'dl', title);
  try {
    mkdirp.sync(dir)
  } catch (err) {
    try {
      var current = now();
      dir = join(sites, siteName, 'dl', title + '-' + current);
      mkdirp.sync(dir)
    } catch (err) {
      throw 'cannot create dl dir' + err
    }
  }
  return dir;
};

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

