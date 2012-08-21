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
  , set = {dldir: out, actions: {}}
  , client
  , log = bot.log

describe('Bot.Log.head', function() {

  describe('defineGetter', function() {
    it('should return response headers', function(done) {
      client = bot(set)
      client.actions.test = function(res, options) {
        res.head.should.eql(log.res)
        done()
      }
      client.set('url', host + '/')
      client.trigger(false, 'test')
    })
    it('should return response statusCode', function(done) {
      client.actions.test = function(res, options) {
        res.status.should.eql(200)
        done()
      }
      client.trigger(false, 'test')
    })
    it('should return response content-type', function(done) {
      client.actions.test = function(res, options) {
        res.type.indexOf('text/html').should.eql(0)
        done()
      }
      client.trigger(false, 'test')
    })
    it('should check if content-type is text/html', function(done) {
      client.actions.test = function(res, options) {
        res.html.should.be.true
        done()
      }
      client.trigger(false, 'test')
    })
    it('should return if server exist', function(done) {
      client.actions.test = function(res, options) {
        res.exist.should.be.true
        done()
      }
      client.trigger(false, 'test')
    })
    it('should return response content-length', function(done) {
      client.actions.test = function(res, options) {
        res.length.should.be.a('number')
        done()
      }
      client.trigger(false, 'test')
    })
    it('should return request path', function(done) {
      client.actions.test = function(res, options) {
        res.path.should.eql('/')
        done()
      }
      client.trigger(false, 'test')
    })
  })

})

