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

    describe('mode:get', function() {
      it('should listen req', function(done){
        log.once('req', function() {
          log.reqI.should.eql(0)
          done()
        })
        act.fn = function(body, url, cwp) {}
        client.request(act, false, act.fn)
      })
      it('should listen res', function(done){
        log.once('res', function() {
          setTimeout(function() {
            log.resI.should.eql(1)
            done()
          }, 5)
        })
        act.fn = function(body, url, cwp) {}
        client.request(act, false, act.fn)
      })
      it('should logging', function() {
        log.res.should.have.length(2)
      })
    })

    describe('mode:write', function() {
      it('should listen req', function(done){
        log.once('req', function() {
          log.reqI.should.eql(2)
          done()
        })
        act.fn = function(body, url, cwp) {}
        client.request(act, true, act.fn)
      })
      it('should listen res', function(done){
        log.once('res', function() {
          setTimeout(function() {
            log.resI.should.eql(3)
            done()
          }, 5)
        })
        act.fn = function(body, url, cwp) {}
        client.request(act, true, act.fn)
      })
      it('should logging', function() {
        log.res.should.have.length(4)
      })
    })

  })

  describe('`error`', function(){
    it('should treat it to be exist if request gets 404', function(done){
      act.fn = function(body, url, cwp) {
        log.res[cwp].statusCode.should.eql(404)
        log.req[cwp].exist.should.be.true
        done()
      }
      act.url = host + '/hogehoge'
      client.request(act, false, act.fn)
    })
    it('should not treat it to be exist if server was not found', function(done){
      act.fn = function(body, url, cwp) {
        should.strictEqual(body, null)
        log.req[cwp].exist.should.be.false
        done()
      }
      act.url = 'http://localhost:9090/'
      client.request(act, false, act.fn)
    })

    it('should not treat it to be exist if server was not found', function(done){
      act.fn = function(body, url, cwp) {
        should.strictEqual(body, null)
        log.req[cwp].exist.should.be.false
        done()
      }
      act.url = 'http://localhost:9090/'
      client.request(act, true, act.fn)
    })
  })

})

