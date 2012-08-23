var utils = require('../lib/utils')
  , should = require('should')

describe('utils', function(){

  describe('.lrc()', function(){
    it('should returns number', function(){
      utils.lrc([4,6,3]).should.be.a('number')
    })
    it('should returns number between 0 and 255', function(){
      utils.lrc([[1]]).should.be.within(0, 256)
    })
  })

  describe('.rangedRand()', function(){
    it('should returns number', function(){
      utils.rangedRand().should.be.a('number')
    })
    it('should returns number', function(){
      utils.rangedRand().should.be.within(0, 100)
    })
  })

  describe('generateHash()', function(){
    it('should return string', function(){
      utils.generateHash(1).should.have.length(8)
    })
  })

})

