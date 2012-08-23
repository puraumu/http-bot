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

var action = new Action()
  , host = 'http://localhost:8989'

describe('Action.request', function() {

  describe('set()', function() {
    it('should assign object to Action\'s options', function() {
      action.set({baz: 'foo'})
      action.options.should.have.property('baz', 'foo')
    })
    it('should assign arguments to Action\'s options', function() {
      action.set('foo', 'bar')
      action.options.should.have.property('foo', 'bar')
    })
  })

  describe('sendRequest()', function(){
    it('should get res.body', function(done){
      action.set('url', host + '/')
      action.sendRequest(function(res) {
        res.body.should.eql('foobar');
        done()
      })
    })
    it('should invoke request', function(done){
      action.actions.test = function(res) {
        res.body.should.eql('foobar');
        done()
      }
      action.trigger('test')
    })
  })

  describe('.do()', function() {
    it('should set the action to `Action`', function() {
      action.do('test', function(res, opt, next) {})
      action.actions.should.have.property('test')
    })
    it('should set the action to `Action` by passing named function', function() {
      function hoge() {}
      action.do(hoge)
      action.actions.should.have.property('hoge')
    })
    it('should return false and alert message when pass anonymous function', function() {
      // action.do(function() {}).should.be.false
    })
  })

  describe('time', function() {
    it('should count response time', function(done) {
      action.sendRequest(function() {
        action.log.duration.should.be.a('number')
        done()
      })
    })
  })

})

