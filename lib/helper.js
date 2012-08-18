
file.call = function(res) {
  var fns = this._b
  for (var key in fns) {
    fns[key](res)
  };
}

file.hasNext = function() {
  return this.urls[this.index + 1] !== undefined
  // if () return false
  // return true
}

file.next = function() {
  if (file.hasNext()) {
    // go next
    this.index++
    this.tryRequest(this.next);
  };
  // end of this.urls
  this.emit('end', this.urls.filter(function(d) { return d.valid }))
  // createAction()
  // action.remain = valid

  // action.next()
  // return this.environment(valid)
}

/**
 * Check the response statusCode. If all urls was checked, start action
 *
 * @param {http.ClientResponse} res
 */

file.checkUrl = function(res) {
  var urls = this.urls
    , index = this.index
  if (399 < res.statusCode) urls[index].valid = false;
  else urls[index].valid = true;
}

file.setTitle = function(res) {
  var title = getTitle(res.body)
  if (title == null) title = now()
  this.urls[this.index].title = title
}

function getTitle(body) {
  var title = ''
  if (body == '') {
    title = null
  } else {
    m = body.match(/<title>(.*)<\/title>/)
    if (m !== null) title = m[1]
    else title = null
  };
  return title
}

/**
 * Try to send request to the server
 *
 * @param {Function} fn
 * @api private
 */

file.tryRequest = function(fn) {
  var url = this.urls[this.index].data
  if (0 != url.indexOf('http')) url = 'http://' + url;
  var req = http.request(parse(url));
  req.end()
  req.on('error', function(err) { fn({statusCode: 400, body: 'notfound'}) })
  req.on('response', function(res) {
    var type = res.headers['content-type'] || '';
    if (type.indexOf('text/html') != 0) return fn(res)
    res.body = ''
    res.on('data', function(chunk) { res.body += chunk })
    res.once('end', function() { fn(res) })
  });
};

