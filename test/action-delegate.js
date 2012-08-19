var root = require('../lib')
  , action = root.action
  , join = require('path').join
  , fs = require('fs')
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

var options = {url: host + '/'}
  , set = {dldir: join(__dirname, '../sd')}
  , act = {
    write: false,
    fn: function() {} }

describe('`action`', function() {

  describe('createBot()', function() {
    it('should have protoact', function() {
      action.createBot(set)
      action.should.have.property('client')
      action.should.have.property('log')
    })
  })

  describe('use()', function() {
    it('should assign object to Bot\'s options', function() {
      action.use(options)
      action.client.options.should.have.property('url', host + '/')
    })
    it('should assign arguments to Bot\'s options', function() {
      action.use('foo', 'bar')
      action.client.options.should.have.property('foo', 'bar')
    })
  })

  describe('.next()', function() {
    it('should invoke function by passing object to Bot', function() {
      act.fn = function(body, url) {
        body.should.eql('foobar')
        done()
      }
      action.next(act)
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

