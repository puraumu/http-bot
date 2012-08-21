var root = require('../')
  , Options = root.Options
  , join = require('path').join
  , fs = require('fs')
  , should = require('should')

var options
  , url = 'http://localhost'
  , cookie = {foo: 'bar', 'hoge': 45}

describe('`options`', function() {

  describe('initialize', function() {
    it('should read arguments', function() {
      options = Options(url)
      options.url.should.eql(url)
    })
  })

  describe('stringify()', function() {
    it('should', function() {
      options.stringify(cookie).should.eql('foo=bar;hoge=45')
    })
  })

  describe('addCookie()', function() {
    it('should add cookie string', function() {
      options.addCookie('hoge=baz')
      options.jar.cookies.should.have.length(1)
    })
    it('should add cookie string', function() {
      options.addCookie('ff=hh')
      options.jar.cookies.should.have.length(2)
    })
    it('should add Array', function() {
      options.addCookie(['e=bar', 'foo=bar'])
      options.jar.cookies.should.have.length(4)
    })
  })

  describe('isbinary()', function() {
    it('should return false if request to get html', function() {
      options.isbinary().should.be.false
    })
    it('should return true if request to binary object', function() {
      options.url = 'http://localhost/foo.gif'
      options.isbinary().should.be.true
    })
  })

  describe('load()', function() {
    it('should load proxy list', function() {
      options.load(['foo', 'bar', 'hoge'])
      options.proxyList.should.have.length(3)
      options.disable('random')
    })
  })

  describe('readProxy()', function(){
    it('should read first item', function(){
      options.readProxy().should.eql('foo')
    })
    it('should read second item', function(){
      options.readProxy().should.eql('bar')
    })
    it('should read third item', function(){
      options.readProxy().should.eql('hoge')
    })
    it('should back to first item', function(){
      options.readProxy().should.eql('foo')
    })
  })

  // describe('.evalProxy()', function() {
    // it('should return true, because 1st request was 200', function() {
      // options.evalProxy(0).should.be.true
    // })
    // it('should return true, because 2nd request was 200', function() {
      // options.evalProxy(1).should.be.true
    // })
  // })

})

