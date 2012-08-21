var root = require('../lib')
  , bot = root.bot
  , should = require('should')
  , express = require('express')
  , app = express()
  , fs = require('fs')
  , join = require('path').join
  , host = 'http://localhost:3003'
  , binary = 'http://localhost/~puraumu/src/CSS-frameworks.pdf'

app.get('/', function(req, res){
  res.send('foobar');
});

app.listen(3003);

var act = {}
  , out = join(__dirname, '../sd')
  , set = {dldir: out}
  , client
  , log = bot.log

describe('Bot', function() {

  describe('new', function() {
    it('should read dldir', function() {
      client = bot(set)
      client.dldir.should.eql(out)
    })
  })

  describe('set()', function() {
    it('should assign arguments', function() {
      client.set('foo', 'bar')
      client.options['foo'].should.eql('bar')
    })
  })

  describe('sendRequest()', function(){
    it('should get res.body', function(done){
      client.set('url', host + '/')
      client.sendRequest(false, function(res) {
        res.body.should.eql('foobar');
        done()
      })
    })
    it('should invoke request', function(done){
      client.actions.test = function(res) {
        res.body.should.eql('foobar');
        done()
      }
      client.trigger(false, 'test')
    })
    /**
    it('should get body and write it', function(done){
      act.fn = function() {}
      act.write = true
      client.trigger(act)
      setTimeout(function() {done()}, 10);
    })
    it('should write binary file', function(done){
      act.fn = function() {}
      client.set('url', binary)
      client.trigger(act)
      setTimeout(function() {done()}, 10);
    })
     */
  })

})

