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

var log = Log()
  , url = 'http://localhost'
  , port = 8989

describe('Log.events', function() {

  before(function(done) {
    var req = http.request({url: url, port: port})
    log.keepHeader('req', req)
    req.end()
    req.on('response', function(res) {
      log.keepHeader('res', res)
      done()
    })
  })

  it('should listen request event', function(done) {
    log.once('req', function() {
      log.req.path.should.eql('/')
      done()
    })
    log.emit('req')
  })
  it('should listen response event', function(done) {
    log.once('res', function() {
      log.res.statusCode.should.eql(200)
      done()
    })
    log.emit('res')
  })

})

