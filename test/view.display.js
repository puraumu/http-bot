var robot = require('../')
  , http = require('http')
  , request = require('../node_modules/request')
  , should = require('should')
  , join = require('path').join

http.createServer(function(req, res) {
  if (req.url == '/') {
    res.writeHead(200, {'Content-Type': 'text/html'})
    res.end('foobar');
  };
}).listen(8989);

var view = new robot.View()
  , host = 'http://localhost'
  , port = 8989
  , url = host + ':' + port
  , clientRequest
  , clientResponse
  , requestRequest
  , requestResponse

describe('View', function(){

  before(function(done) {
    var req = http.request({url: host, port: port})
    req.end()
    clientRequest = req
    clientRequest.exist = true
    req.on('response', function(res) {
      clientResponse = res
      done()
    })
  })

  before(function(done) {
    request({url: url}, function(err, res) {
      requestRequest = this
      requestRequest.exist = true
      requestResponse = res
      done()
    })
  })

  describe('http.request', function() {
    describe('displayRequest()', function() {
      it('should display request header', function() {
        // view.displayRequest(clientRequest, url)
      })
    })
    describe('displayResponse()', function() {
      it('should display response header', function() {
        // view.displayResponse(clientResponse, url, 4)
      })
    })
    describe('showVerboseRequest()', function() {
      it('should display verbose response header', function() {
        // view.showVerboseRequest(clientRequest)
      })
    })
    describe('showVerboseResponse()', function() {
      it('should display verbose response header', function() {
        // view.showVerboseResponse(clientResponse)
      })
    })
  })

  describe('`request`', function() {
    describe('displayRequest()', function() {
      it('should display request header', function() {
        // view.displayRequest(requestRequest, url)
      })
    })
    describe('displayResponse()', function() {
      it('should display response header', function() {
        // view.displayResponse(requestResponse, url, 4)
      })
    })
    describe('showVerboseRequest()', function() {
      it('should display verbose response header', function() {
        // view.showVerboseRequest(requestRequest)
      })
    })
    describe('showVerboseResponse()', function() {
      it('should display verbose response header', function() {
        // view.showVerboseResponse(requestResponse)
      })
    })
  })


})

