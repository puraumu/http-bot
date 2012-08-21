var root = require('../lib')
  , bot = root.bot
  , should = require('should')
  , express = require('express')
  , app = express()
  , join = require('path').join
  , host = 'http://localhost:3009'

app.get('/', function(req, res){
  res.send('foobar');
});

app.listen(3009);

function noop() {}

var act = {}
  , out = join(__dirname, '../sd')
  , set = {dldir: out, actions: {}}
  , client
  , log = bot.log

describe('Bot.Log.events', function() {

  it('should listen request event', function(done) {
    client = bot(set)
    log.once('req', function() {
      log.req.path.should.eql('/')
      done()
    })
    client.actions.test = noop
    client.set('url', host + '/')
    client.trigger(false, 'test')
  })
  it('should listen response event', function(done) {
    log.once('res', function() {
      log.res.statusCode.should.eql(200)
      done()
    })
    client.trigger(false, 'test')
  })
  it('should listen notfound event', function(done) {
    log.once('notfound', function() {
      log.req.exist.should.false
      done()
    })
    client.set('url', 'http://localhost:9090/')
    client.trigger(false, 'test')
  })

})

