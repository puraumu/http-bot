var root = require('../lib')
  , action = root.action
  , join = require('path').join
  , fs = require('fs')
  , should = require('should')
  // , express = require('express')
  // , app = express()
  // , host = 'http://localhost:3002';

// app.get('/', function(req, res){
  // res.send('foobar');
// });

// app.get('/title', function(req, res){
  // res.send('<title>here is title</title>');
// });

// app.listen(3002);

var file = getter.file
  , settings = getter.settings
  , action = getter.action
  , act = {
    cookie: {},
    url: host + '/',
    withproxy: false,
    write: false,
    fn: function() {} }
  , set = {
      jqueryPath: join(__dirname, './files/jquery.min.js'),
      proxyPath: join(__dirname,'./files/proxy.json'),
      queuePath: join(__dirname,'./files/queue.json'),
      siteName: 'test',
      protoact: act }

describe('init()', function() {
  it('should initialize Objects', function() {
    file._silent = true
    getter.init(set)
  })
})

})

describe('`action`', function() {
  it('prepare', function() {
    settings.proxyPath = ''
    settings.queuePath = ''
    act.fn = function() {}
    act.write = false
    getter.start(settings)
    file.urls = []
    action.index = 0
    file.urls.push(host + '/')
    file.urls.push(host + '/title')
  })

  describe('initialized', function() {
    it('should have protoact', function() {
      action.protoact.should.eql(act)
    })
  })

  describe('.next()', function() {
    it('should loop valid urls', function() {
      action.next()
      settings.dldir.should.not.be.empty
    })
    it('should increase counter', function() {
      action.index.should.eql(1)
    })
  })

  describe('.createBot()', function() {
    it('should create `Bot`', function() {
      action.next()
      // console.log(action.client);
      // console.log(action.log);
    })
  })

  describe('.add()', function() {
    it('should have protoact', function() {
    })
  })

  describe('.failed()', function() {
    it('should have protoact', function() {
    })
  })

})

