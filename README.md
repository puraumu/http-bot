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

## License

(The MIT License)

Copyright (C) 2012 Puraumu

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

