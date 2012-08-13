var request = require('../node_modules/request')
  , should = require('should')
  , fs = require('fs')
  , express = require('express')
  , http = require('http')
  , app = express()

// app.use(express.cookieParser('foobar'))
// app.use(express.session())

app.get('/login', function(req, res){
  res.send('<form id="login"></form>');
});

app.get('/echo', function(req, res){
  res.writeHead(200, {taste: req.get('cookie')});
  // res.cookie('foo', req.cookies.foo)
  req.pipe(res);
});

app.get('/json', function(req, res){
  res.send({ name: 'manny' });
});

app.get('/agent', function(req, res){
  res.send(req.get('User-Agent'));
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

http.createServer(app).listen(3001);

var url = 'http://localhost:3001'

describe('request', function(){

  describe('basic action', function(){
    it('should send request', function(done){
      request(url + '/', function(err, res){
        res.statusCode.should.be.eql(200)
        done();
      })
    })
    it('should send request', function(done){
      request(url + '/agent', function(err, res){
        console.log(res.body);
        done();
      })
    })
    it('should send with cookie', function(done){
      var j = request.jar()
        , cookie = request.cookie('foo=bar')
      j.add(cookie)
      request({url: url + '/echo', jar: j}, function(err, res){
        res.headers.taste.should.include('foo=bar')
        done();
      })
    })
    it('should send with cookie #1', function(done){
      var j = request.jar()
        , cok = ['ipb_member_id=482400', 'ipb_pass_hash=98f8437e66b8186429968e69389a7a1c', 'yay=3c98541581175f1878a12ca22bacb3345b647533', 'lv=0']
      for (var i = 0, len = cok.length; i < len; i++) {
        var item = cok[i];
        j.add(request.cookie(item))
      };
      request({url: url + '/echo', jar: j}, function(err, res){
        console.log(res.headers);
        // .taste.should.include('foo=bar')
        done();
      })
    })

    it('should be 302 without redirection', function(done){
      request({url: url + '/movies', followRedirect: false}, function(err, res){
        res.statusCode.should.be.eql(302)
        done();
      })
    })
    it('should be 404', function(done){
      request(url + '/test', function(err, res){
        res.statusCode.should.be.eql(404)
        done();
      })
    })
    it('should get as binary', function(done){
      var bin = 'http://macpro.local/~puraumu/src/CSS-frameworks.pdf'
        , name = 'frameworks.pdf'
        , options = {}
      options.url = bin
      options.encoding = 'binary'
      request(options, function(err, res){
        res.statusCode.should.eql(200)
        fs.writeFile(name, res.body, 'binary', function(err){
          if (err) throw err;
          done();
        })
      })
    })
  })

})
