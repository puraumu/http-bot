var root = require('../lib')
  , bot = root.bot
  , should = require('should')
  , express = require('express')
  , app = express()
  , join = require('path').join
  , host = 'http://localhost:3005'

app.get('/', function(req, res){
  res.send('foobar');
});

app.listen(3005);

var act = {}
  , out = join(__dirname, '../sd')
  , set = {dldir: out}
  , client
  , log = bot.log

describe('Bot-Log', function() {

  describe('req', function() {
    it('should have request header', function(done) {
      client = bot(set)
      client.set('url', host + '/')
      act.fn = function(body, url) {
        log.req.path.should.eql('/')
        done()
      }
      client.trigger(act)
    })
  })

  describe('res', function() {
    it('should have response header', function(done) {
      act.fn = function(body, url) {
        log.res.statusCode.should.eql(200)
        done()
      }
      client.trigger(act)
    })
  })

  describe('event', function() {
    it('should listen request event', function(done) {
      act.fn = function() {};
      log.once('req', function() {
        log.req.path.should.eql('/')
        done()
      })
      client.set('url', host + '/')
      client.trigger(act)
    })
    it('should listen response event', function(done) {
      log.once('res', function() {
        log.res.statusCode.should.eql(200)
        done()
      })
      client.trigger(act)
    })
    it('should listen notfound event', function(done) {
      log.once('notfound', function() {
        log.req.exist.should.false
        done()
      })
      client.set('url', 'http://localhost:9090/')
      client.trigger(act)
    })
  })

  describe('`error`', function(){
    it('should treat it to be exist if request gets 404', function(done){
      act.fn = function(body, url) {
        log.res.statusCode.should.eql(404)
        log.req.exist.should.be.true
        done()
      }
      client.set('url', host + '/hogehoge')
      client.trigger(act)
    })
    it('should not treat it to be exist if server was not found', function(done){
      act.fn = function(body, url) {
        should.strictEqual(body, null)
        log.req.exist.should.be.false
        done()
      }
      client.set('url', 'http://localhost:9090/')
      client.trigger(act)
    })
  })

})

