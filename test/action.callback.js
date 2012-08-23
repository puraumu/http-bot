var robot = require('../')
  , Action = robot.Action
  , http = require('http')
  , should = require('should')
  , join = require('path').join

http.createServer(function(req, res) {
  if (req.url == '/') {
    res.writeHead(200, {'Content-Type': 'text/html'})
    res.end('foobar');
  };
  if (req.url == '/hoge') {
    res.writeHead(200, {'Content-Type': 'text/html'})
    res.end('hogehoge');
  };
}).listen(8989);

function noop() {}

var host = 'http://localhost:8989'
  , out = join(__dirname, '../sd')
  , set = {dldir: out, actions: {test: noop, end: noop}}
  , action

describe('Action.callback', function() {

  it('should return response headers and request options', function(done) {
    action = new Action(set)
    action.actions.test = function(res, options) {
      res.should.have.property('statusCode')
      options.should.have.property('href')
      done()
    }
    action.set('url', host + '/')
    action.trigger('test')
  })

  describe('response', function() {
  })

  describe('options', function() {
    it('should have requested url', function(done) {
      action.actions.test = function(res, options) {
        options.href.should.eql(host + '/hoge')
        done()
      }
      action.set('url', host + '/hoge')
      action.trigger('test')
    })
  })

  describe('next', function() {
    it('should iterate action', function(done) {
      action.actions.end = function(res, options, next) {
        options.href.should.eql(host + '/')
        done()
      }
      action.actions.test = function(res, options, next) {
        options.href.should.eql(host + '/hoge')
        options.set('url', host + '/')
        next('end')
      }
      action.set('url', host + '/hoge')
      action.trigger('test')
    })
  })

})

