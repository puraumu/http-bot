var root = require('../lib')
  , bot = root.bot
  , should = require('should')
  , express = require('express')
  , app = express()
  , join = require('path').join
  , host = 'http://localhost:3006'

app.get('/', function(req, res){
  res.send('foobar');
});

app.listen(3006);

var act = {}
  , out = join(__dirname, '../sd')
  , set = {dldir: out}
  , client
  , log = bot.log

describe('Bot.Log.head', function() {

  describe('defineGetter', function() {
    it('should return response headers', function(done) {
      client = bot(set)
      client.set('url', host + '/')
      act.fn = function(body, log) {
        log.head.should.eql(log.res)
        done()
      }
      client.trigger(act)
    })
    it('should return response statusCode', function(done) {
      act.fn = function(body, log) {
        log.status.should.eql(200)
        done()
      }
      client.trigger(act)
    })
    it('should return response content-type', function(done) {
      act.fn = function(body, log) {
        log.type.indexOf('text/html').should.eql(0)
        done()
      }
      client.trigger(act)
    })
    it('should check if content-type is text/html', function(done) {
      act.fn = function(body, log) {
        log.html.should.be.true
        done()
      }
      client.trigger(act)
    })
    it('should return if server exist', function(done) {
      act.fn = function(body, log) {
        log.exist.should.be.true
        done()
      }
      client.trigger(act)
    })
    it('should return response content-length', function(done) {
      act.fn = function(body, log) {
        log.length.should.be.a('number')
        done()
      }
      client.trigger(act)
    })
    it('should return request path', function(done) {
      act.fn = function(body, log) {
        log.path.should.eql('/')
        done()
      }
      client.trigger(act)
    })
  })

})

