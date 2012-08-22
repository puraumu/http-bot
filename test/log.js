var root = require('../')
  , Log = root.Log
  , http = require('http')
  , should = require('should')
  , join = require('path').join

http.createServer(function(req, res) {
  if (req.url == '/') {
    res.end('foobar');
  };
}).listen(8989);

function noop() {}

var log = new Log()
  , url = 'http://localhost'
  , port = 8989

describe('Log', function() {

  describe('req', function() {
    it('should have request header', function() {
      log.keepHeader('req', http.request({url: url, port: port}))
      log.req.path.should.eql('/')
    })
  })

  describe('res', function() {
    it('should have response header', function(done) {
      http.get({url: url, port: port}, function(res) {
        log.keepHeader('res', res)
        log.res.statusCode.should.eql(200)
        done()
      })
    })
  })

})

