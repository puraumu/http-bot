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

function noop() {}

var act = {}
  , out = join(__dirname, '../sd')
  , set = {dldir: out, actions: {}}
  , client
  , log = bot.log

describe('Bot.Log', function() {

  describe('req', function() {
    it('should have request header', function(done) {
      client = bot(set)
      client.actions.test = function(res, options) {
        log.req.path.should.eql('/')
        done()
      }
      client.set('url', host + '/')
      client.trigger(false, 'test')
    })
  })

  describe('res', function() {
    it('should have response header', function(done) {
      client.actions.test = function(res, options) {
        res.statusCode.should.eql(200)
        done()
      }
      client.trigger(false, 'test')
    })
  })

  describe('`error`', function(){
    it('should treat it to be exist if request gets 404', function(done){
      client.actions.test = function() {
        log.res.statusCode.should.eql(404)
        log.req.exist.should.be.true
        done()
      }
      client.set('url', host + '/hogehoge')
      client.trigger(false, 'test')
    })
    it('should not treat it to be exist if server was not found', function(done){
      client.actions.test = function(res) {
        // should.strictEqual(res.body, null)
        log.req.exist.should.be.false
        done()
      }
      client.set('url', 'http://localhost:9090/')
      client.trigger(false, 'test')
    })
  })

  describe('time', function() {
    it('should count response time', function(done) {
      client.actions.test = function() {
        log.duration.should.be.a('number')
        done()
      }
      client.set('url', host + '/hogehoge')
      client.trigger(false, 'test')
    })
  })

})

