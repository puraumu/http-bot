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

})

