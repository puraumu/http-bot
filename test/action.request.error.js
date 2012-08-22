var robot = require('../')
  , Action = robot.Action
  , http = require('http')
  , should = require('should')
  , join = require('path').join

http.createServer(function(req, res) {
  if (req.url == '/') {
    res.writeHead(200, {'Content-Type': 'text/html'})
    return res.end('foobar');
  };
  res.writeHead(404, {'Content-Type': 'text/html'})
  res.end('Not Found');
}).listen(8989);

var action = new Action()
  , host = 'http://localhost:8989'

var out = join(__dirname, '../sd')
  , set = {dldir: out}

describe('Action.request.error', function() {

  describe('error()', function() {
    it('should assign function to action._error', function() {
      var foo = function() {}
      action.error(foo)
      action._error.should.eql(foo)
    })
    it('should call the error function when server was not found', function(done) {
      action.error(function(req) {
        req.exist.should.be.false;
        done()
      })
      action.set('url', 'http://localhost:9090/')
      action.sendRequest();
    })
  })

  describe('`request`', function(){
    it('should treat it to be exist if request gets 404', function(done){
      action.set('url', host + '/hogehoge')
      action.sendRequest(false, function() {
        action.log.res.statusCode.should.eql(404)
        action.log.req.exist.should.be.true
        done()
      })
    })
    it('should not treat it to be exist if server was not found', function(done){
      action.set('url', 'http://localhost:9090/')
      action._error = function(req) {
        req.exist.should.be.false
        done()
      };
      action.sendRequest()
    })
  })

  describe('`event`', function() {
    it('should listen notfound event', function(done) {
      action.log.once('notfound', function() {
        action.log.req.exist.should.false
        done()
      })
      action.set('url', 'http://localhost:9090/')
      action._error = function() {  };
      action.sendRequest()
    })
  })

})
