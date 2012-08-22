var Robot = require('../')
  , http = require('http')
  , join = require('path').join
  , should = require('should')
  , host = 'http://localhost:8979';

http.createServer(function(req, res) {
  if (req.url == '/') {
    res.writeHead(200, {'Content-Type': 'text/html'})
    res.end('foobar');
  };
  res.writeHead(404, {'Content-Type': 'text/html'})
  res.end('<h1>Not Found.</h1>');
}).listen(8979);

function noop() {};

var robot

describe('`Robot`', function() {

  /**
  beforeEach(function() {
    robot = new Robot()
    robot.set('url', host + '/')
    robot.disable('silent')
    robot.disable('warning')
    robot.disable('request')
    robot.disable('response')
    robot.disable('debug')
    robot.do('test', function(res, opt, next) {
      opt.done();
    })
    robot.error(function(res, opt, next) {
      opt.done();
    })
    console.log('test begins');
  })

  describe('switch views', function() {
    it('should be silent', function(done) {
      robot.set('done', done)
      robot.enable('silent')
      robot.start('test')
    })
    it('should show `notfound` error', function(done) {
      robot.set('done', done)
      robot.set('url', 'http://localhost:7779/')
      robot.enable('warning')
      robot.start('test')
    })
    it('should show request results', function(done) {
      robot.set('done', done)
      robot.enable('request')
      robot.start('test')
    })
    it('should show response results', function(done) {
      robot.set('done', done)
      robot.enable('response')
      robot.start('test')
    })
  })
   */

})

