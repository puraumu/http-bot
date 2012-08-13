var jsdom = require('../../node_modules/jsdom')
  , getter = require('../../lib')
  , Info = getter.Info
  , Parser = getter.Parser
  , utils = getter.utils
  , fs = require('fs')
  , join = require('path').join

/**
 * conf
 */

function stack_name() {
  return "stack" + new Date().toLocaleTimeString().replace(/:/g, '-') + ".json"
}

process.on('uncaughtException', function(){
  if (stack.length != 0) {
    fs.writeFileSync(join(__dirname, stack_name()), JSON.stringify(stack))
  }
})
process.on('exit', function(){
  if (stack.length != 0) {
    fs.writeFileSync(join(__dirname, stack_name()), JSON.stringify(stack))
  }
})

var siteName = 'NAME'
  , set = {}
  , stack = []

set.jquery = join(__dirname, '../jquery.min.js')
set.proxy = join(__dirname, '../proxy.json')
set.queue = join(__dirname, './queue.json')
set.random = false

/**
 * Load
 */

var info = new Info(set)

