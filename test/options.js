var root = require('../')
  , Options = root.Options
  , join = require('path').join
  , fs = require('fs')
  , parse = require('url').parse
  , should = require('should')

var options = new Options()
  , host = 'http://localhost:3434'
  , cookie = {foo: 'bar', 'hoge': 45}

describe('`options`', function() {

  describe('set()', function() {
    it('should assign setting to val', function() {
      options.set('foo', 'bar')
      options.should.have.property('foo', 'bar')
    })
    it('should convert to object and have its property if setting is url', function() {
      var url = parse(host + '/foo')
      options.set('url', host + '/foo')
      for (var key in url) {
        options[key].should.eql(url[key])
      };
    })
  })

  describe('stringify()', function() {
    it('should', function() {
      options.stringify(cookie).should.eql('foo=bar;hoge=45')
    })
  })

  describe('isbinary()', function() {
    it('should return false if request to get html', function() {
      options.isbinary().should.be.false
    })
    it('should return true if request to binary object', function() {
      options.set('url', 'http://localhost/foo.gif')
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

