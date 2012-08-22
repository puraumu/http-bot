var robot = require('../')
  , http = require('http')
  , should = require('should')
  , join = require('path').join

http.createServer(function(req, res) {
  if (req.url == '/') {
    res.writeHead(200, {'Content-Type': 'text/html'})
    res.end('foobar');
  };
}).listen(8989);

var view = robot.view
  , url = 'http://localhost'
  , port = 8989
  , request
  , response

describe('view', function(){

  before(function(done) {
    var req = http.request({url: url, port: port})
    req.end()
    request = req
    req.on('response', function(res) {
      response = res
      done()
    })
  })

  describe('displayRequest()', function() {
    it('should display request header', function() {
      view.displayRequest(request)
    })
  })

  describe('displayResponse()', function() {
    it('should display response header', function() {
      view.displayResponse(response)
    })
  })

})
