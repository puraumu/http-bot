# HTTP-BOT

`HTTP-BOT`enables you to make chaining requests easily.

## Example

``` javascript
var robot = require('robot');

robot.set('url', 'http://www.google.com');

robot.do('google', function(res, opt, next) {
  console.log(res.body); // The google web page.
  opt.set('url', 'http://www.apple.com'); // Set the next site.
  next('apple');
});

robot.do('apple', function(res, opt, next) {
  console.log(res.body); // The apple web page.
  next(); // end robot
});

robot.start('google');
```

## API

### Class Log

This object inherit `http.ClientResponse`. 

### Class Options

This object will be passed to `http.request()`.

### do (name, callback)

Register a callback. This callback will be invoked when `http.ClientResponse` emits `end` event.

### error (callback)

If `http.ClientRequest` emits `error` event this callback will be invoked. Because of getting `error` event, response object is not available. So the first argument of this callback is actually `http.ClientRequest`. 

### set (setting, value)

Set argument to `Options`.

### start (name)

Invoke the name of function which was registered by calling `do`. Also start to listen `Log` events. 

### enable, disable (setting)

Enable `View` to change display mode. Following modes are available:

* `silent` - No message will be shown even if connection error occurred. Default: false.
* `warning` - Show the url which could not establish connection. Default: true.
* `request` - Show the url to be sent to server. Default true.
* `response` - Show the url which got response. Default: true.

