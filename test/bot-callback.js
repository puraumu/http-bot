var root = require('../lib')
  , bot = root.bot
  , should = require('should')
  , express = require('express')
  , app = express()
  , join = require('path').join
  , host = 'http://localhost:3007'

app.get('/', function(req, res){
  res.send('foobar');
});

app.listen(3007);

var act = {}
  , out = join(__dirname, '../sd')
  , set = {dldir: out}
  , client
  , log = bot.log

describe('Bot.callback', function() {

  it('should return response headers and request options', function(done) {
    client = bot(set)
    client.set('url', host + '/')
    act.fn = function(res, options) {
      res.should.have.property('statusCode')
      options.should.have.property('url')
      done()
    }
    client.trigger(act)
  })

  describe('response', function() {
  })

  describe('options', function() {
    it('should have requested url ', function(done) {
      client.set('url', host + '/hoge')
      act.fn = function(res, options) {
        options.url.should.eql(host + '/hoge')
        done()
      }
      client.trigger(act)
    })
  })

})

