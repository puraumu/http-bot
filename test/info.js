var getter = require('../lib/info')
  , join = require('path').join
  , fs = require('fs')
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

app.listen(3002);

var file = getter.file
  , settings = getter.settings
  , info = getter.info
  , action = getter.action
  , set = {
      jqueryPath: join(__dirname, './files/jquery.min.js'),
      proxyPath: join(__dirname,'./files/proxy.json'),
      queuePath: join(__dirname,'./files/queue.json'),
      siteName: 'test',
      mode: 'test'}

describe('init()', function() {
  it('should initialize Objects', function() {
    getter.init(set)
  })
})

describe('`settings`', function() {
  describe('initialized', function() {
    it('should have jqueryPath', function() {
      settings.jqueryPath.should.eql(set.jqueryPath)
    })
    it('should have proxyPath', function() {
      settings.proxyPath.should.eql(set.proxyPath)
    })
    it('should have queuePath', function() {
      settings.queuePath.should.eql(set.queuePath)
    })
  })
  describe('createDir()', function() {
    it('should create dir based on this', function() {
      fs.exists(join(settings._sites, settings.siteName, 'dl'), function(exists) {
        exists.should.be.true
      })
    })
  })
})

describe('`file`', function() {
  it('should have jquery', function(){
    file.jquery.should.not.be.empty
  })
  it('should have proxy list', function(){
    file.proxyList.should.be.empty
  })
  it('should set urls', function(){
    file.urls.should.not.be.empty
  })
  it('should read the first url', function(){
    file.urls[0].data.should.eql('http://localhost:3232/foo/bar/hoge')
  })
})

describe('`info`', function() {
  describe('.checkUrl() and .tryRequest()', function(){
    it('prepare', function() {
      info.tryRequest()
    })
    it('should get 2xx as valid', function(done){
      var target = host + '/'
      file.urls.push({data: target, valid: false})
      info.tryRequest()
      setTimeout(function() {
        file.urls[1].valid.should.be.true
        done()
      }, 10)
    })
    it('should get 4xx as invalid', function(done){
      var target = host + '/hoho'
      file.urls.push({data: target, valid: true})
      info.tryRequest()
      setTimeout(function() {
        file.urls[2].valid.should.be.false
        done()
      }, 10)
    })
    it('should get title from res.body', function(done){
      var target = host + '/title'
      file.urls.push({data: target, valid: false})
      info.tryRequest()
      setTimeout(function() {
        file.urls[3].title.should.eql('here is title')
        done()
      }, 10)
    })
  })
})

describe('`action`', function() {
})


  /**
   * comment
  // info, proxy, retry => bot
  describe('.environment()', function() {
    it('should', function() {
      var urls = [], len = 3
      for (var i = 0; i < len; i++) {
        urls.push({data: host + '/' + String(i), title: 'env-' + String(i)})
      };
      info.environment(urls)
    })
  })

  // bot, cwp, reqhead, reshead => header errors
  describe('.failed()', function() {
    it('should', function() {
    })
  })

  // info, wait?, (stack?) => bot
  describe('.pushAct()', function() {
    it('should', function() {
    })
  })

  // info, title, => bot, dir
  describe('.dldir()', function() {
    it('should', function() {
    })
  })

  // bot, cwp, type, reshead, reqhead => stdout
  describe('.logger()', function() {
    it('should', function() {
    })
  })

  // bot, errors => {file}
  describe('.writeErrors()', function() {
    it('should', function() {
    })
  })

  // bot, proxy => {file}
  describe('.writeProxy()', function() {
    it('should', function() {
    })
  })

  // info, urls => {file}
  describe('.write()', function() {
    it('should', function() {
    })
  })
   */

