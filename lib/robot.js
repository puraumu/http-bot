
/**
 * Module dependencies.
 */

var http = require('http')
  , Action = require('./action')
  , Options = require('./options')
  , utils = require('./utils')
  , view = require('./view')
  , Log = require('./log')

/**
 * Expose `robot`.
 */

exports = module.exports = {};

/**
 * Expose internals.
 */

exports.Log = Log;
exports.view = view;
exports.Action = Action;
exports.Options = Options;

/**
 * Create `robot`.
 */

function createRobot() {
  utils.merge(robot, action)
  return robot;
};

// robot.val = 'hoge'

