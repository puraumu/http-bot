var Getter = require('../')
  , Parser = Getter.Parser
  , should = require('should')
  , express = require('express')
  , app = express()
  , fs = require('fs')
  , join = require('path').join
  , host = 'http://localhost:3003'

app.get('/', function(req, res){
  res.send('foobar');
});

app.get('/foo', function(req, res){
  res.send('foo, bar');
});

app.get('/hoge', function(req, res){
  res.send("here is content\n");
});

app.listen(3003);

var act = {}, set = {}, parser, out = join(__dirname, '../sd')
act.fn = function() {  }
act.cookie = []
act.url = host + '/'
act.withproxy = false
act.mode = 'get'

set.proxy = [{data:'foo'}, {data:'bar'}, {data:'hoge'}]
set.dldir = out
set.retry = false

describe('Parser', function() {

  describe('new', function() {
    it('should be initialized', function() {
      parser = Parser(set)
      parser.proxyList.should.have.length(3)
    })
    it('should read dldir', function() {
      parser.dldir.should.eql(out)
    })
    it('should read retry', function() {
      parser.retry.should.eql(false)
    })
  })

  describe('request()', function(){
    it('should get 200', function(done){
      act.fn = function(body, url, cwp) {
          body.should.eql('foobar');
          done() }
      parser.request(act, 0)
    })
    // it('should with proxy', function(){
    // })
    it('should get body and write it', function(done){
      act.mode = 'write'
      act.fn = function() {}
      act.url = host + '/hoge'
      parser.request(act, 1)
      done()
    })
  })

  describe('.keepHeader()', function() {
    it('should wait', function (done) {
      setTimeout(function() { done() }, 5)
    })
    it('should keep response headers', function() {
      parser.resHeaders.should.have.length(2)
    })
    it('should keep request headers', function() {
      parser.reqHeaders.should.have.length(2)
    })
  })

  describe('readProxy()', function(){
    it('should read first item', function(){
      parser._proxy = -1;
      parser.readProxy(false).should.eql('foo')
    })
    it('should read second item', function(){
      parser.readProxy(false).should.eql('bar')
    })
    it('should read third item', function(){
      parser.readProxy(false).should.eql('hoge')
    })
    it('should read first item', function(){
      parser.readProxy(false).should.eql('foo')
    })
  })

  describe('.evalProxy()', function() {
    it('should return true, because 1st request was 200', function() {
      parser.evalProxy(0).should.be.true
    })
    it('should return true, because 2nd request was 200', function() {
      parser.evalProxy(1).should.be.true
    })
  })

  describe('`error`', function(){
    it('should get 404 but no warnings', function(done){
      parser.once('notfound', function() {
        throw 'should not be invoked'
      })
      act.url = host + '/hogehoge'
      act.mode = 'get'
      act.fn = function(body, url, cwp) {
        parser.resHeaders[cwp].statusCode.should.eql(404)
        parser.removeAllListeners('notfound')
        done()
      }
      parser.request(act, 2)
    })
    // it('should get `notfound` event because act.url is invalid.', function(done){
      // parser.once('notfound', function(redirects, cwp) {
        // parser.reqHeaders[cwp].exist.should.be.false
        // done()
      // })
      // act.url = 'http://hogehoge.local'
      // act.fn = function(body, url, cwp) {
        // should.strictEqual(body, null)
      // }
      // parser.request(act, 3)
    // })
    // it('should not write response when not found', function(done){
      // parser.once('notfound', function(){
        // parser.errors.should.have.length(3)
        // done()
      // })
      // act.url
      // act.mode = 'write'
      // act.fn = function() { throw 'boooom!' }
      // parser.request(act)
    // })

  })

})

