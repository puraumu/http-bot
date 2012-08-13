var express = require('express')
  , assert = require('assert')
  , Getter = require('../')
  , app = express.createServer()
  , Sender = Getter.Sender;

app.get('/login', function(req, res){
  res.send('<form id="login"></form>');
});

app.get('/echo', function(req, res){
// app.post('/echo', function(req, res){
  // console.log(req.get('cookie'));
  res.writeHead(200, req.headers);
  req.pipe(res);
});

app.get('/json', function(req, res){
  res.send({ name: 'manny' });
});

app.get('/', function(req, res){
  res.send('root');
  // res.redirect('/movies');
});

app.get('/movies', function(req, res){
  res.redirect('/movies/all');
});

app.get('/movies/all', function(req, res){
  res.redirect('/movies/all/0');
});

app.get('/movies/all/0', function(req, res){
  res.send('first movie page');
});

app.get('/links', function(req, res){
  res.header('Link', '<https://api.github.com/repos/visionmedia/mocha/issues?page=2>; rel="next"');
  res.end();
});

app.listen(3000);

var sender = new Sender();

describe('Sender', function(){

  describe('.setHeader()', function(){
    // it('should ignore none object', function(){
      // sender.setHeader('foo')
      // sender.header.should.exist({})
      // sender.setHeader(['foo'])
      // sender.header.should.have.keys([])
    // })
    it('should set header passed', function(doen){
      sender.get('http://localhost:3000/echo')
          .set({foo: 'bar'}).end(function(res){
            res.header['foo'].should.be.eql('foo');
            done;
          });
    })
  })

  describe('.setProxy()', function(){
    it('should set proxy', function(){
      sender.setProxy('http://localhost:9909')
      sender.proxy.should.eql('http://localhost:9909')
    })
    it('should add url scheme', function(){
      sender.setProxy('localhost:9909')
      sender.proxy.should.eql('http://localhost:9909')
    })
    it('should unset proxy', function(){
      sender.setProxy('')
      sender.proxy.should.be.empty
    })
  })

  describe('.ignBuf()', function(){
    it('should ', function(){
      sender.ignBuf() // default is true
      sender.buffer.should.be.false;
    })
  })

  describe('.request()', function(){
    it('should with header', function(){
      // sender.setHeader({foo: 'bar'}).
    })
    it('should with proxy', function(){
    })
    it('should without header', function(){
    })
    it('should without proxy', function(){
    })
    it('should ignore buffer', function(){
    })
  })

  describe('.end()', function(){
    it('should acquire buffer', function(){
    })
  })

})

