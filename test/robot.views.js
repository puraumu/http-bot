var robot = require('../')
  , http = require('http')
  , should = require('should')
  , host = 'http://localhost:8979'
  , count = 0

http.createServer(function(req, res) {
  if (req.url == '/success') {
    res.writeHead(200, {'Content-Type': 'text/html'})
    res.end('');
  };
  if (req.url == '/redirection') {
    res.writeHead(302, {'Content-Type': 'text/html'})
    res.end('');
  };
  if (req.url == '/clientError') {
    res.writeHead(404, {'Content-Type': 'text/html'})
    res.end('');
  };
  if (req.url == '/serverError') {
    res.writeHead(503, {'Content-Type': 'text/html'})
    res.end('');
  };
  res.writeHead(404, {'Content-Type': 'text/html'})
  res.end('<h1>Not Found.</h1>');
}).listen(8979);

describe('`Robot.view`', function() {

  before(function() {
    robot.do('test', function(res, opt, next) {
      opt.done();
    })
    robot.error(function(res, opt, next) {
      opt.done();
    })
  })

  beforeEach(function() {
    count++;
    robot.set('url', host + '/success')
    robot.disable('silent')
    robot.disable('warning')
    robot.disable('request')
    robot.disable('response')
    robot.disable('debug')
    robot.disable('verboseRequest')
    robot.disable('verboseWarning')
    robot.disable('success')
    robot.disable('redirection')
    robot.disable('clientError')
    robot.disable('serverError')
    console.log('#%d begins', count);
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
      robot.reset().display()
      robot.start('test')
    })
    it('should show request result', function(done) {
      robot.set('done', done)
      robot.enable('request')
      robot.reset().display()
      robot.start('test')
    })
    it('should show response result #4', function(done) {
      robot.set('done', done)
      robot.enable('response')
      robot.reset().display()
      robot.start('test')
    })
    it('should show verbose request result', function(done) {
      robot.set('done', done)
      robot.enable('request')
      robot.enable('verboseRequest')
      robot.reset().display()
      robot.start('test')
    })
    it('should show verbose `notfound` error', function(done) {
      robot.set('done', done)
      robot.set('url', 'http://localhost:7779/')
      robot.enable('warning')
      robot.enable('verboseWarning')
      robot.reset().display()
      robot.start('test')
    })
    it('should show verbose 2xx, 3xx, 4xx, 5xx results #7', function(done) {
      robot.set('done', done)
      robot.set('url', host + '/success')
      robot.enable('response')
      robot.enable('success')
      robot.reset().display()
      robot.start('test')
    })
    it('should show verbose 3xx, 4xx, 5xx results', function(done) {
      robot.set('done', done)
      robot.set('url', host + '/redirection')
      robot.enable('response')
      robot.enable('redirection')
      robot.reset().display()
      robot.start('test')
    })
    it('should show verbose 4xx, 5xx results', function(done) {
      robot.set('done', done)
      robot.set('url', host + '/clientError')
      robot.enable('response')
      robot.enable('clientError')
      robot.reset().display()
      robot.start('test')
    })
    it('should show verbose 5xx results', function(done) {
      robot.set('done', done)
      robot.set('url', host + '/serverError')
      robot.enable('response')
      robot.enable('serverError')
      robot.reset().display()
      robot.start('test')
    })
  /**
   */

  })

})

