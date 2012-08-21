# HTTP-BOT

The `HTTP-BOT` enables you make chaining requests easily.

## Example

``` javascript
var action = require('action');

action = action({actions: {}});
action.set('url', 'http://www.google.com');

action.do('google', function(res, opt, next) {
  console.log(res.body); // The google web page.
  opt.set('url', 'http://www.apple.com'); // Set the next site.
  next('apple');
});

action.do('apple', function(res, opt, next) {
  console.log(res.body); // The apple web page.
  next(); // end actions
});

action.start('google');
```


