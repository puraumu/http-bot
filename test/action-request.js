var robot = require('../')
  , Action = robot.Action
  , http = require('http')
  , should = require('should')
  , join = require('path').join

http.createServer(function(req, res) {
  if (req.url == '/') {
    res.writeHead(200, {'Content-Type': 'text/html'})
    res.end('foobar');
  };
}).listen(8989);

var action
  , host = 'http://localhost:8989'
  , binary = 'http://localhost/~puraumu/src/CSS-frameworks.pdf'

var out = join(__dirname, '../sd')
  , set = {dldir: out}
  // , log = bot.log

describe('Action.request', function() {

  describe('new', function() {
    it('should read dldir', function() {
      action = new Action(set)
      action.dldir.should.eql(out)
    })
  })

  describe('set()', function() {
    it('should assign arguments', function() {
      action.set('foo', 'bar')
      action.options['foo'].should.eql('bar')
    })
  })

  describe('sendRequest()', function(){
    it('should get res.body', function(done){
      action.set('url', host + '/')
      action.sendRequest(false, function(res) {
        res.body.should.eql('foobar');
        done()
      })
    })
    it('should invoke request', function(done){
      action.actions.test = function(res) {
        res.body.should.eql('foobar');
        done()
      }
      action.trigger(false, 'test')
    })
  })

  describe('time', function() {
    it('should count response time', function(done) {
      action.sendRequest(false, function() {
        action.log.duration.should.be.a('number')
        done()
      })
    })
  })

  /**
  it('should get body and write it', function(done){
    act.fn = function() {}
    act.write = true
    client.trigger(act)
    setTimeout(function() {done()}, 10);
  })
  it('should write binary file', function(done){
    act.fn = function() {}
    client.set('url', binary)
    client.trigger(act)
    setTimeout(function() {done()}, 10);
  })
   */

})

