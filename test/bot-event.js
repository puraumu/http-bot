var bot = require('../lib/bot')
  , should = require('should')
  , express = require('express')
  , app = express()
  // , fs = require('fs')
  , join = require('path').join
  , host = 'http://localhost:3004'

app.get('/', function(req, res){
  res.send('foobar');
});

app.get('/foo', function(req, res){
  res.send('foo, bar');
});

app.get('/hoge', function(req, res){
  res.send("here is content\n");
});

app.listen(3004);

var act = {}
  , set = {}
  , client
  , log = bot.log
  , out = join(__dirname, '../sd')

act.fn = function() {  }
act.cookie = []
act.url = host + '/'
act.withproxy = false
act.mode = 'get'

set.proxy = []
set.dldir = out
set.retry = false

describe('Bot Events', function() {

  it('prepare', function() {
    client = bot(set)
  })

  describe('log', function(){

    describe('mode: get', function() {
      it('should listen req', function(done){
        log.once('req', function() {
          log.reqI.should.eql(0)
          done()
        })
        act.fn = function(body, url, cwp) {}
        client.request(act)
      })
      it('should listen res', function(done){
        log.once('res', function() {
          log.resI.should.eql(1)
          done()
        })
        act.fn = function(body, url, cwp) {}
        client.request(act)
      })
      it('should logging', function() {
        log.res.should.have.length(2)
      })
    })

    describe('mode: write', function() {
      it('should listen req', function(done){
        log.once('req', function() {
          log.reqI.should.eql(2)
          done()
        })
        act.fn = function(body, url, cwp) {}
        act.url = host + '/hoge'
        act.mode = 'write'
        console.log(act);
        client.request(act, 2)
      })
      it('should listen res', function(done){
        log.once('res', function() {
          log.resI.should.eql(3)
          done()
        })
        act.fn = function(body, url, cwp) {}
        client.request(act, 3)
      })
      it('should logging', function() {
        log.res.should.have.length(4)
      })
    })

  })


  // describe('log event', function(){
    // it('should listen add', function(done){
      // log.once('res', function(type, cwp) {
        // type.should.eql('req')
        // cwp.should.eql(0)
        // // done()
      // })
      // log.once('add', function(type, cwp) {
        // type.should.eql('res')
        // cwp.should.eql(0)
        // done()
      // })
      // act.fn = function(body, url, cwp) {}
      // client.request(act, 0)
    // })
    // it('should get body and write it', function(done){
      // act.mode = 'write'
      // act.fn = function() {}
      // act.url = host + '/hoge'
      // client.request(act, 1)
      // done()
    // })
  // })

  // describe('Bot.log', function() {
    // describe('.keepHeader()', function() {
      // it('should wait', function (done) {
        // setTimeout(function() { done() }, 5)
      // })
      // it('should keep response headers', function() {
        // log.res.should.have.length(2)
      // })
      // it('should keep request headers', function() {
        // log.req.should.have.length(2)
      // })
    // })
  // })

  describe('`error`', function(){
    // it('should get 404 but no warnings', function(done){
      // client.once('notfound', function() {
        // throw 'should not be invoked'
      // })
      // act.url = host + '/hogehoge'
      // act.mode = 'get'
      // act.fn = function(body, url, cwp) {
        // log.res[cwp].statusCode.should.eql(404)
        // client.removeAllListeners('notfound')
        // done()
      // }
      // client.request(act, 2)
    // })
    // it('should get `notfound` event because act.url is invalid.', function(done){
      // client.once('notfound', function(redirects, cwp) {
        // client.reqHeaders[cwp].exist.should.be.false
        // done()
      // })
      // act.url = 'http://hogehoge.local'
      // act.fn = function(body, url, cwp) {
        // should.strictEqual(body, null)
      // }
      // client.request(act, 3)
    // })
    // it('should not write response when not found', function(done){
      // client.once('notfound', function(){
        // client.errors.should.have.length(3)
        // done()
      // })
      // act.url
      // act.mode = 'write'
      // act.fn = function() { throw 'boooom!' }
      // client.request(act)
    // })
  })

})

