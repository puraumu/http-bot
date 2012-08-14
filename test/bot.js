var getter = require('../')
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

var act = {}, set = {}, bot, out = join(__dirname, '../sd')
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
      bot = getter.bot(set)
      bot.proxyList.should.have.length(3)
    })
    it('should read dldir', function() {
      bot.dldir.should.eql(out)
    })
    it('should read retry', function() {
      bot.retry.should.eql(false)
    })
  })

  describe('request()', function(){
    it('should get 200', function(done){
      act.fn = function(body, url, cwp) {
          body.should.eql('foobar');
          done() }
      bot.request(act, 0)
    })
    // it('should with proxy', function(){
    // })
    it('should get body and write it', function(done){
      act.mode = 'write'
      act.fn = function() {}
      act.url = host + '/hoge'
      bot.request(act, 1)
      done()
    })
  })

  describe('.keepHeader()', function() {
    it('should wait', function (done) {
      setTimeout(function() { done() }, 5)
    })
    it('should keep response headers', function() {
      bot.resHeaders.should.have.length(2)
    })
    it('should keep request headers', function() {
      bot.reqHeaders.should.have.length(2)
    })
  })

  describe('readProxy()', function(){
    it('should read first item', function(){
      bot._proxy = -1;
      bot.readProxy(false).should.eql('foo')
    })
    it('should read second item', function(){
      bot.readProxy(false).should.eql('bar')
    })
    it('should read third item', function(){
      bot.readProxy(false).should.eql('hoge')
    })
    it('should read first item', function(){
      bot.readProxy(false).should.eql('foo')
    })
  })

  describe('.evalProxy()', function() {
    it('should return true, because 1st request was 200', function() {
      bot.evalProxy(0).should.be.true
    })
    it('should return true, because 2nd request was 200', function() {
      bot.evalProxy(1).should.be.true
    })
  })

  describe('`error`', function(){
    it('should get 404 but no warnings', function(done){
      bot.once('notfound', function() {
        throw 'should not be invoked'
      })
      act.url = host + '/hogehoge'
      act.mode = 'get'
      act.fn = function(body, url, cwp) {
        bot.resHeaders[cwp].statusCode.should.eql(404)
        bot.removeAllListeners('notfound')
        done()
      }
      bot.request(act, 2)
    })
    // it('should get `notfound` event because act.url is invalid.', function(done){
      // bot.once('notfound', function(redirects, cwp) {
        // bot.reqHeaders[cwp].exist.should.be.false
        // done()
      // })
      // act.url = 'http://hogehoge.local'
      // act.fn = function(body, url, cwp) {
        // should.strictEqual(body, null)
      // }
      // bot.request(act, 3)
    // })
    // it('should not write response when not found', function(done){
      // bot.once('notfound', function(){
        // bot.errors.should.have.length(3)
        // done()
      // })
      // act.url
      // act.mode = 'write'
      // act.fn = function() { throw 'boooom!' }
      // bot.request(act)
    // })

  })

})

