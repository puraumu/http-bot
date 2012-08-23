var robot = require('../')
  , Action = robot.Action
  , view = robot.view
  , join = require('path').join
  , should = require('should')
  , express = require('express')
  , app = express()

app.get('/', function(req, res){
  res.send('root');
});

app.get('/user/:id', function(req, res) {
  res.send('user: ' + req.params.id)
});

app.listen(3000);

var action = new Action()
  , log = action.log
  , len = 3
  , count = 0
  , host = 'http://localhost:3000'

describe('Multiple request', function() {

  function counter(res, done) {
    count++;
    var body = res.body
      , url = log.url
      , userId = body[body.length - 1]
      , urlId = url[url.length - 1]
    userId.should.eql(urlId);
    if (count == len) done()
  };

  beforeEach(function() {
    count = 0;
  })

  describe('next loop', function() {
    it('should return the same id of log.url and res.body', function(done) {
      action.do('test', function(res, opt, next) {
        next()
        counter(res, done);
      });
      action.do('first', function(res, opt, next) {
        var url = host + '/user/';
        for (var i = 0; i < len; i++) {
          opt.set('url', url + String(i))
          next('test');
        };
      });
      action.set('url', host + '/');
      action.trigger('first');
    })
  })

  describe('trigger loop', function() {
    it('should return the same id of log.url and res.body', function(done) {
      action.do('test', function(res, opt, next) {
        next()
        counter(res, done);
      });
      var url = host + '/user/';
      for (var i = 0; i < len; i++) {
        action.set('url', url + String(i))
        action.trigger('test');
      };
    })
  })

})

