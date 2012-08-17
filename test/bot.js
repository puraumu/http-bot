var bot = require('../lib/bot')
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

var act = {}, set = {}, client, log = bot.log, out = join(__dirname, '../sd')
act.fn = function() {  }
act.cookie = []
act.url = host + '/'
act.withproxy = false
act.mode = 'get'

set.proxy = [{data:'foo'}, {data:'bar'}, {data:'hoge'}]
set.dldir = out
set.retry = false

describe('Bot', function() {

  describe('new', function() {
    it('should be initialized', function() {
      client = bot(set)
      client.proxyList.should.have.length(3)
    })
    it('should read dldir', function() {
      client.dldir.should.eql(out)
    })
    it('should read retry', function() {
      client.retry.should.eql(false)
    })
  })

  describe('request()', function(){
    it('should get 200', function(done){
      act.fn = function(body, url, cwp) {
          body.should.eql('foobar');
          done() }
      client.request(act)
    })
    it('should get body and write it', function(done){
      act.mode = 'write'
      act.fn = function() {}
      act.url = host + '/hoge'
      client.request(act)
      done()
    })
  })

  describe('readProxy()', function(){
    it('should read first item', function(){
      client._proxy = -1;
      client.readProxy(false).should.eql('foo')
    })
    it('should read second item', function(){
      client.readProxy(false).should.eql('bar')
    })
    it('should read third item', function(){
      client.readProxy(false).should.eql('hoge')
    })
    it('should read first item', function(){
      client.readProxy(false).should.eql('foo')
    })
  })

  describe('.evalProxy()', function() {
    it('should return true, because 1st request was 200', function() {
      client.evalProxy(0).should.be.true
    })
    it('should return true, because 2nd request was 200', function() {
      client.evalProxy(1).should.be.true
    })
  })

})

