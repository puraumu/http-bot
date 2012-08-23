var root = require('../')
  , Log = root.Log
  , http = require('http')
  , should = require('should')
  , join = require('path').join

http.createServer(function(req, res) {
  if (req.url == '/') {
    res.writeHead(200, {'Content-Type': 'text/html'})
    res.end('foobar');
  };
}).listen(8989);

var log = new Log()
  , url = 'http://localhost'
  , port = 8989

describe('Log.head', function() {

  before(function(done) {
    var req = http.request({url: url, port: port})
    log.keepHeader('req', req)
    req.end()
    req.on('response', function(res) {
      log.keepHeader('res', res)
      done()
    })
  })

  describe('defineGetter', function() {
    it('should return response headers', function() {
      log.res.head.should.eql(log.res)
    })
    it('should return response statusCode', function() {
      log.res.status.should.eql(200)
    })
    it('should return response content-type', function() {
      log.res.type.indexOf('text/html').should.eql(0)
    })
    it('should check if content-type is text/html', function() {
      log.res.html.should.be.true
    })
    it('should return if server exist', function() {
      log.res.exist.should.be.true
    })
    it('should return response content-length', function() {
      log.res.length.should.be.a('number')
    })
    it('should return request path', function() {
      // console.log(log.req);
      // log.res.path.should.eql('/')
    })
  })

})

