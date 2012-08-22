var Robot = require('../')
  , http = require('http')
  , join = require('path').join
  , should = require('should')
  , host = 'http://localhost:8989';

http.createServer(function(req, res) {
  if (req.url == '/') {
    res.writeHead(200, {'Content-Type': 'text/html'})
    res.end('foobar');
  };
  if (req.url == '/title') {
    res.writeHead(200, {'Content-Type': 'text/html'})
    res.end('<html><head><title>here is title</title></head></html>');
  };
  res.writeHead(404, {'Content-Type': 'text/html'})
  res.end('<h1>Not Found.</h1>');
}).listen(8989);

function noop() {};

var robot = new Robot()

describe('`Robot`', function() {

  describe('basic function', function() {
    it('should get response', function(done) {
      robot.do('test', function(res, opt, next) {
        res.body.should.eql('foobar')
        done();
      })
      robot.set('url', host + '/')
      robot.start('test')
    })
    it('should return request header if server was not found', function(done) {
      robot.do('test', function() {})
      robot.error(function(req, opt, next) {
        req.path.should.eql('/')
        done()
      })
      robot.set('url', 'http://localhost:9090/')
      robot.start('test')
    })
  })

})

