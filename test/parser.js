var Getter = require('../')
  , Parser = Getter.Parser
  , should = require('should')
  , express = require('express')
  , app = express()
  , host = 'http://localhost:3003'
  , parser;

app.get('/', function(req, res){
  res.send('foobar');
});

app.get('/foo', function(req, res){
  res.send('foo, bar');
});

app.get('/hoge', function(req, res){
  res.send('here is content');
});

app.listen(3003);

var set = {
      jquery: 'foobar',
      proxy: ['foo', 'bar', 'hoge'],
      url: host + '/' };

describe('Parser', function(){

  describe('new', function(){
    it('should be initialized', function(){
      parser = new Parser(set)
      parser.title.should.be.empty
      parser._url.should.eql(host + '/')
    })
  })

  describe('pushAct()', function(){
    it('should invoke fn #1', function(done){
      var d = {
        cookie: '',
        url: host + '/',
        withproxy: false,
        mode: 'get',
        fn: function(body, url, n){
          body.should.eql('foobar');
          done()
        } }
      parser.pushAct(d)
    })
  })

  describe('request()', function(){
    it('should get 200', function(done){
      var d = {
        cookie: '',
        url: host + '/',
        withproxy: false,
        mode: 'get',
        fn: function(body, url){
          body.should.eql('foobar');
          done()
        } }
      parser.request(d)
    })
    // it('should with proxy', function(){
    // })
    it('should get body and write it', function(done){
      parser.title = 'foo-hoge'
      var d = {
        cookie: '',
        url: host + '/hoge',
        withproxy: false,
        mode: 'write',
        fn: function(){} }
      parser.request(d)
      done()
    })
    it('should write file with name current date', function(done){
      parser.title = ''
      var d = {
        cookie: '',
        url: host + '/hoge',
        withproxy: false,
        mode: 'write',
        fn: function(){} }
      parser.request(d)
      done()
    })
  })

  describe('readProxy()', function(){
    it('should read first item', function(){
      parser._proxy = -1;
      parser.readProxy(false).should.eql('foo')
    })
    it('should read second item', function(){
      parser.readProxy(false).should.eql('bar')
    })
    it('should read third item', function(){
      parser.readProxy(false).should.eql('hoge')
    })
    it('should read first item', function(){
      parser.readProxy(false).should.eql('foo')
    })
  })

  describe('`error`', function(){
    it('should get 404 and details', function(done){
      parser.once('error', function(){
        parser.errors.should.have.length(1)
        done()
      })
      var d = {
        cookie: '',
        url: host + '/hogehoge',
        withproxy: false,
        mode: 'get',
        fn: function(body, url){ parser.emit('error') } }
      parser.request(d)
    })
    it('should invoke function with argument null', function(done){
      var d = {
        cookie: '',
        url: 'hogehoge',
        withproxy: false,
        mode: 'get',
        fn: function(body, url, n){ should.strictEqual(body, null);done() } }
      parser.request(d)
    })
    it('should not write response when not found', function(done){
      parser.once('notfound', function(){
        parser.errors.should.have.length(3)
        done()
      })
      var d = {
        cookie: '',
        url: 'boboobobd',
        withproxy: false,
        mode: 'write',
        fn: function(){ throw 'boooom!!' } }
      parser.request(d)
    })
  })

  describe('`end`', function(){
    it('should write errors as json', function(done){
      parser.once('end', function(){ done(); })
      parser.emit('end', 'file')
    })
    it('should put errors to stdout', function(done){
      parser.once('end', function(){ done(); })
      parser.emit('end', 'log')
    })
  })

})

