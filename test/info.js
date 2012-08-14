var getter = require('../')
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

var info
  , set = {
      jquery: jqueryPath = join(__dirname, './files/jquery.min.js'),
      proxy: proxyPath = join(__dirname,'./files/proxy.json'),
      queue: queuePath = join(__dirname,'./files/queue.json'),
      name: 'test',
      mode: 'test'}

describe('Info', function(){

  describe('new', function(){
    it('should be initialized with argument', function(){
      info = getter.info(set)
    })
    it('should be jqueryPath', function(){
      info.jqueryPath.should.eql(jqueryPath)
    })
    it('should be proxyPath', function(){
      info.proxyPath.should.eql(proxyPath)
    })
    it('should be queuePath', function(){
      info.queuePath.should.eql(queuePath)
    })
    it('should loadFiles', function(){
      info.jquery.should.not.be.empty;
    })
    it('should read proxy list', function(){
      // info.proxy.should.be.empty;
    })
    it('should set urls', function(){
      info.urls.should.not.be.empty;
    })
    it('should read the first url', function(){
      info.urls[0].data.should.eql('http://localhost:3232/foo/bar/hoge');
    })
  })

  describe('.createDir()', function() {
    it('should', function() {
      fs.exists(join(info._sites, info.siteName, 'dl'), function(exists) {
        exists.should.be.true
      })
    })
  })

  describe('.loadFiles()', function() {
    it('should', function() {
    })
  })

  describe('.checkUrl() and .tryRequest()', function(){
    it('should prepare', function() {
      info.tryRequest()
      // setTimeout(function() { console.log(info.urls);done() }, 20)
    })
    it('should get 2xx as valid', function(done){
      var target = host + '/'
      info.urls.push({data: target, valid: false})
      info.tryRequest()
      setTimeout(function() {
        info.urls[1].valid.should.be.true
        done()
      }, 10)
    })
    it('should get 4xx as invalid', function(done){
      var target = host + '/hoho'
      info.urls.push({data: target, valid: true})
      info.tryRequest()
      setTimeout(function() {
        info.urls[2].valid.should.be.false
        done()
      }, 10)
    })
    it('should get title from res.body', function(done){
      var target = host + '/title'
      info.urls.push({data: target, valid: false})
      info.tryRequest()
      setTimeout(function() {
        info.urls[3].title.should.eql('here is title')
        done()
      }, 10)
    })
  })

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

})

