
  it('should listen notfound event', function(done) {
    http.get({url: url, port: 9090})
    log.once('notfound', function() {
      log.req.exist.should.false
      done()
    })
    client.set('url', 'http://localhost:9090/')
    client.trigger(false, 'test')
  })

  describe('`error`', function(){
    it('should treat it to be exist if request gets 404', function(done){
      client.actions.test = function() {
        log.res.statusCode.should.eql(404)
        log.req.exist.should.be.true
        done()
      }
      client.set('url', host + '/hogehoge')
      client.trigger(false, 'test')
    })
    it('should not treat it to be exist if server was not found', function(done){
      client.actions.test = function(res) {
        // should.strictEqual(res.body, null)
        log.req.exist.should.be.false
        done()
      }
      client.set('url', 'http://localhost:9090/')
      client.trigger(false, 'test')
    })
  })
