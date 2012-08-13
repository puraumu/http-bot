var EventEmitter = require('events').EventEmitter
  , http = require('http')
  , parse = require('url').parse
  , format = require('url').format;

/**
 * TYPE: Controller, Operator
 */

/**
 * http helper, Sender
 *
 * Events:
 *
 */

function Sender() {
  var self = this;
  this.method = '';
  this.url = '';
  this.proxy = '';
  this.header = {};
  this.writable = true;
  this.buffer = true;
  this.on('response', function(res){
    self.callback(null, res);
  });
}

/**
 * Expose `Sender`.
 */

module.exports = Sender;

/**
 * Inherit from `EventEmitter.prototype`.
 */

Sender.prototype.__proto__ = EventEmitter.prototype;

/**
 * Noop.
 */

function noop() {};

/**
 * Invoke the callback with `err` and `res`
 * and handle arity check.
 *
 * @param {Error} err
 * @param {Response} res
 * @api private
 */

Sender.prototype.callback = function(err, res){
  var fn = this._callback;
  if (2 == fn.length) return fn(err, res);
  fn(res); // TODO: emit error
};

/**
 * Set GET request
 *
 * @param {String} url
 * @return {Sender} for chaining
 */

Sender.prototype.get = function(url) {
  if ('string' != typeof url) url = format(url);
  this.url = url;
  this.method = 'get';
  return this
};

/**
 * Set POST request
 *
 * @param {String} url
 * @return {Sender} for chaining
 *
 * TODO
 */

Sender.prototype.post = function(url) {
  if ('string' != typeof url) url = format(url);
  this.url = url;
  this.method = 'post'
  return this
};

/**
 * Send request with data
 *
 * TODO
 *
 * @return {Sender} for chaining
 * @api public
 */

// Sender.prototype.data = function(first_argument) {
// };

/**
 * Check if `obj` is an object.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isObject(obj) {
  return null != obj && 'object' == typeof obj;
}

/**
 * header
 *
 * @param {Object} head
 * @return {Sender} for chaining
 * @api public
 */

Sender.prototype.setHeader = function(head) {
  if (isObject(head)) {
    this.header = head
  };
  return this;
};

/**
 * Set proxy
 *
 * @param {String} proxy
 * @return {Sender} for chaining
 * @api public
 */

Sender.prototype.setProxy = function(proxy) {
  if (proxy === '') { this.proxy = proxy; return this; };
  if (0 != proxy.indexOf('http')) proxy = 'http://' + proxy;
  this.proxy = proxy;
  return this;
};

/**
 * Set buffer to be ignored
 *
 * @return {Sender} for chaining
 * @api public
 */

Sender.prototype.ignBuf = function() {
  this.buffer = false;
  return this;
};

/**
 * Send request to server
 *
 * @return {OutgoingMessage}
 * @api private
 *
 * TODO
 * custom error message?
 * proxy => OK?
 * method? POST,
 */

Sender.prototype.request = function() {
  var url = this.url;
  if (0 != url.indexOf('http')) url = 'http://' + url;

  var uri = parse(url)
    , options = {
        host: uri.hostname,
        port: uri.port,
        path: uri.path,
        method: this.method };

  if (this.proxy !== '') {
    var proxy = parse(this.proxy);
    options.host = proxy.hostname;
    options.port = proxy.port;
    options.path = uri.href;
  };

  // request
  var req = this.req = http.request(options);

  req.on('error', function(err){ self.emit('error', err); });

  return req;
};

/**
 * Initiate request, invoking callback `fn(err, res)`
 * with an instanceof `Response`
 *
 * @param {Function} fn
 * @return {Sender} for chaining
 * @api public
 */

Sender.prototype.end = function(fn) {
  var self = this
    , req = this.request()
    , buffer = this.buffer;

  // store callback
  this._callback = fn || noop;

  req.on('response', function(res){
    var type = res.headers['content-type'] || '';

    if (buffer) {
      res.body = '';
      res.setEncoding('utf8');
      res.on('data', function (chunk) { res.body += chunk; });
    };

    self.res = res;
    res.on('end', function(){
      self.emit('response', self.res);
      // self.emit('response', self.req, self.res);
      // self.emit('end');
      // fn(body);
    });
  });

  req.end(); // ?? => .end()
  return this;
};

/**
 * Slimen response?
 *
 * @param {Response} res
 * @return {Object}
 * @api private
 */

Sender.prototype.slimen = function(res) {
  return {
    headers: res.res.headers
  }
};

