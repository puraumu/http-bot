var request = require('../node_modules/request')
  , root = require('../lib')
  , view = root.view
  , should = require('should')
  , express = require('express')
  , app = express()

app.get('/', function(req, res){
  res.send('body');
});

app.listen(3006);

var url = 'http://localhost:3006'
  , opt = {url: url + '/'}
  , set = {debug: false, _sites: ''}
  , res
  , req

describe('view', function(){

  describe('req', function() {
    it('prepare', function(done) {
      request(opt, function(err, response) {
        res = response;
        req = this;
        req.exist = true;
        done();
      })
    })
    it('should display request header', function() {
      view = view(set)
      view.log = {res: res, req: req}
      view.req()
    })
  })

  describe('res', function() {
    it('should display response header', function() {
      view.res()
    })
  })

})

