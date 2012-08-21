
/**
 * Module dependencies.
 */

var http = require('http')
  , action = require('./action')
  , options = require('./options')
  , utils = require('./utils')
  , view = require('./view')
  , bot = require('./bot')

/**
 * Expose `robot`.
 */

var robot = module.exports = {};

/**
 * Expose internals.
 */

exports.bot = bot;
exports.view = view;
exports.action = action;
exports.options = options;

/**
 * Create `robot`.
 */

  utils.merge(robot, action)
function createRobot() {
  utils.merge(robot, action)
  return robot;
};

robot.val = 'hoge'

