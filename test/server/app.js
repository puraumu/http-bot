var express = require('express');

var app = express();

app.set('json spaces', 0);

app.use(express.bodyParser());

app.get('/', function(req, res){
  res.send('root');
});

app.get('/redirect', function(req, res){
  res.redirect('/test/');
});

app.get('/user/:id', function(req, res) {
  res.send('user: ' + req.params.id)
});

app.get('/error', function(req, res){
  res.status(500).send('fail');
});

app.get('/unauthorized', function(req, res){
  res.send(401);
});

app.get('/bad-request', function(req, res){
  res.send(400);
});

app.get('/not-acceptable', function(req, res){
  res.send(406);
});

app.get('/no-content', function(req, res){
  res.send(204);
});

app.get('/querystring', function(req, res){
  res.send(req.query);
});

app.post('/echo', function(req, res){
  res.send(req.body);
});

app.post('/pet', function(req, res){
  res.send('added ' + req.body.name + ' the ' + req.body.species);
});

app.get('/pets', function(req, res){
  res.send(['tobi', 'loki', 'jane']);
});

app.get('/foo', function(req, res){
  res
    .header('Content-Type', 'application/x-www-form-urlencoded')
    .send('foo=bar');
});

app.use(express.static(__dirname + '/../files'));

app.listen(3000);
console.log('Test server listening on port 3000');

