var join = require('path').join
  , fs = require('fs')
  , http = require('http')
  , parse = require('url').parse
  , utils = require('./utils')
  , parser = require('./parser')
  , mkdirp = require('../node_modules/mkdirp')
  , history = require('../node_modules/history')
  , querystring = require('querystring')
  , basename = require('path').basename
  , extname = require('path').extname

/**
 * Expose `Info`.
 */

 var info = module.exports = createInfo;

/**
 * Models
 *
 * @param {Object} set
 *
 * set:
 *
 *   - {String} jquery  jquery path
 *   - {String} proxy  proxy path
 *   - {String} queue  queue path
 *   - {String} name  site name
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

function createInfo (set) {
  info.jqueryPath = set.jquery
  info.proxyPath = set.proxy
  info.queuePath = set.queue
  info.jquery = '';
  info.proxy = [];
  info.urls = [];
  info.i_url = '';
  info._sites = join(__dirname, '../sites');
  info.siteName = set.name;

  info.title = '';
  info.href = ''; // url, top url

  info.protoact = []

  info.errors = []; // => data: url, valid: true
  info.valid = [];

  info.loadFiles();
  info.createDir();
  return info;
  // dep
  // this._sites = join(__dirname, '../sites');
  // this.siteName = set.name;
  // this.jquery = set.jquery;
  // this._url = set.url || now(); // first url to use

}

/**
 * Create directories when initializing
 *
 * @api private
 * OK
 */

info.createDir = function() {
  mkdirp(join(this._sites, this.siteName, 'dl'), function(err){
    if (err) console.error(err)
  })
};

/**
 * Read files to get proxys, download list and jQuery.
 *
 * OK
 */

info.loadFiles = function() {
  this.jquery = fs.readFileSync(this.jqueryPath).toString()
  var proxyPath = this.proxyPath;
  if (proxyPath == '') {
    console.log('no proxys are loaded.');
  } else {
    var pstr = fs.readFileSync(proxyPath).toString()
    if (pstr == '') console.log('no proxys are loaded.');
    else this.proxy = JSON.parse(pstr)
  }
  var qstr = fs.readFileSync(this.queuePath).toString()
  if (qstr == '') {
    console.log('no queues are loaded.');
    this.environment([]);
  } else {
    var queue = JSON.parse(qstr)
    this.urls = queue.map(function(d) {
      return {data: d, valid: true}
    });
    this.i_url = 0;
  }
};

/**
 * OK
 */

info.checkUrl = function(status) {
  var urls = info.urls
    , n = this.i_url;
  if (399 < status) info.urls[n].valid = false;
  else info.urls[n].valid = true;
  n += 1
  // TODO
  if (n == 0) return // no such url in urls
  if (urls[n] === undefined) {
    // end of this.urls
    var valid = urls.filter(function(d) { return d.valid })
    this.environment(valid)
    return
  };
  // go next
  info.i_url = n;
  info.tryRequest();
};

/**
 * check current URL works
 *
 * OK
 */

info.tryRequest = function() {
  var self = this
    , url = this.urls[this.i_url].data
  if (0 != url.indexOf('http')) url = 'http://' + url;
  var req = http.request(parse(url));
  req.end()
  req.on('error', function(err) { self.checkUrl(400) });
  req.on('response', function(res) {
    var type = res.headers['content-type'] || '';
    self.checkUrl(res.statusCode)
  });
};

/**
 * Create Parser?
 * --------------
 */

info.environment = function(valid) {
  var self = this
    , retry = true
    , remain = history(valid)

  // TODO dl dir?
  info.retry = retry
  info._url = remain.now() // => action, this url is not required when creating
  var bot = this.bot = parser(info)
  bot.on('request', function(cwp) { // bot sent request
    self.logger('req', cwp)
  })
  bot.on('notfound', function(redirects, cwp) { // bot cannnot find the page
    self.failed(cwp)
  })
  bot.on('response', function(cwp) { // bot got response
    self.logger('res', cwp)
  })
  bot.on('end', function() { // all actions have been finished
  })
}

/**
 * Interface
 * =========
 */

/**
 * Save request and response to errors
 *
 * @param {Number} cwp
 * @api public
 * TODO
 * add req and res to errors
 */

info.failed = function(cwp) {
  var bot = this.bot
    , errors = this.errors

  errors.push(bot.reqHeaders[cwp])
  errors.push(bot.resHeaders[cwp])
};

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
 * Add action to do next. The method delegate added action to `Parser`.
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

info.pushAct = function(action) {
  if (!isAction(action)) return this;
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

  var bot = this.bot
  bot.actions.push(obj)

  // var pager = this.actions;
  // pager.push(obj);
  // pager.next();
};

/**
 * Views
 * =====
 */

/**
 * Return time now as string.
 *
 * @api private
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
  if (title == '') title = this.title = now();
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
    var headers = this.bot.reqHeaders[cwp]
      , exist = headers.exist ? '✔' :  '✖'
      , proxy = !!headers.proxy ? headers.proxy : '';
    stout += exist + " " + headers.method + " " + headers.url;
    if (proxy != '') stout += " >> " + proxy;
  };
  if ( type == 'res') {
    var headers = this.bot.resHeaders[cwp]
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

