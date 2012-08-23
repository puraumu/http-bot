var robot = require('../')
  , join = require('path').join
  , should = require('should')
  , express = require('express')
  , app = express()

app.get('/user/:id', function(req, res) {
  res.send('user: ' + req.params.id)
});

app.listen(3000);

var len = 3
  , count = 0
  , host = 'http://localhost:3000'

describe('Robot.Multiple', function() {

  function counter(done) {
    count++;
    if (count == len) done()
  };

  beforeEach(function() {
    count = 0;
  })

  describe('trigger loop', function() {
    it('should return the same id of log.url and res.body', function(done) {
      robot.enable('silent')
      robot.do('test', function(res, opt, next) {
        // console.log(res.url, res.body);
        next()
        counter(done);
      });
      var part = host + '/user/';
      for (var i = 0; i < len; i++) {
        robot.set('url', part + String(i))
        robot.start('test');
      };

    })
  })

})

