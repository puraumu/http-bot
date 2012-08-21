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

function noop() {}

var out = join(__dirname, '../sd')
  , set = {dldir: out, actions: {test: noop, end: noop}}
  , client
  , log = bot.log

describe('Action.callback', function() {

  it('should return response headers and request options', function(done) {
    client = bot(set)
    client.actions.test = function(res, options) {
      res.should.have.property('statusCode')
      options.should.have.property('url')
      done()
    }
    client.set('url', host + '/')
    client.trigger(false, 'test')
  })

  describe('response', function() {
  })

  describe('options', function() {
    it('should have requested url ', function(done) {
      client.actions.test = function(res, options) {
        options.url.should.eql(host + '/hoge')
        done()
      }
      client.set('url', host + '/hoge')
      client.trigger(false, 'test')
    })
  })

  describe('next', function() {
    it('should iterate action', function(done) {
      client.actions.end = function(res, options, next) {
        options.url.should.eql(host + '/')
        done()
      }
      client.actions.test = function(res, options, next) {
        options.url.should.eql(host + '/hoge')
        options.set('url', host + '/')
        next('end')
      }
      client.set('url', host + '/hoge')
      client.trigger(false, 'test')
    })
  })

})

