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
      var current = utils.now();
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
  if (title == null) title = utils.now()
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

