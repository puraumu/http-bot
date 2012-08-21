var root = require('../')
  , join = require('path').join
  , should = require('should')
  , express = require('express')
  , app = express()
  , host = 'http://localhost:3002';

app.get('/', function(req, res){
  res.send('foobar');
});

app.get('/title', function(req, res){
  res.send('<title>here is title</title>');
});

app.listen(3010);

function noop() {};

var options = {}
  , out = join(__dirname, '../sd')
  , set = {dldir: out, actions: {}}
  , robot

describe('`robot`', function() {

  describe('describe', function() {
    it('should', function() {
      robot = root;
      console.dir(robot);
    })
  })

})

