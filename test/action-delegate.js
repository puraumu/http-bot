var root = require('../lib')
  , action = root.action
  , join = require('path').join
  , should = require('should')
  , express = require('express')
  , app = express()
  , host = 'http://localhost:3002';

app.get('/', function(req, res){
  res.send('foobar');
});

app.get('/title', function(req, res){
  res.send('<title>here is title</title>');
});

app.listen(3002);

function noop() {};

var options = {}
  , out = join(__dirname, '../sd')
  , set = {dldir: out, actions: {}}

describe('`action`', function() {

  describe('createBot()', function() {
    it('should have protoact', function() {
      action.createBot(set)
      action.should.have.property('client')
      action.should.have.property('log')
    })
  })

  describe('set()', function() {
    it('should assign object to Bot\'s options', function() {
      action.set({url: host + '/'})
      action.client.options.should.have.property('url', host + '/')
    })
    it('should assign arguments to Bot\'s options', function() {
      action.set('foo', 'bar')
      action.client.options.should.have.property('foo', 'bar')
    })
  })

  describe('.do()', function() {
    it('should set the action to `Bot`', function() {
      action.do('test', function(res, opt, next) {})
      action.client.actions.should.have.property('test')
    })
    it('should set the action to `Bot` by passing named function', function() {
      function hoge() {}
      action.do(hoge)
      action.client.actions.should.have.property('hoge')
    })
    it('should return false when pass anonymous function', function() {
      // action.do(function() {}).should.be.false
    })
  })

  describe('.start()', function() {
    it('should invoke function by passing object to Bot', function(done) {
      action.do('test', function(res, opt, next) {
        res.body.should.eql('foobar')
        done()
      })
      action.start('test')
    })
  })

  describe('.add()', function() {
    it('should have protoact', function() {
    })
  })

  describe('.failed()', function() {
    it('should have protoact', function() {
    })
  })

})

