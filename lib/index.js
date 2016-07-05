var chalk = require('chalk');

exports.kueStates = ['active', 'inactive', 'complete', 'delayed', 'failed'];

var queue;

exports.init = function(_queue) {
  queue = _queue;
};

exports.exit = function(exitCode) {
  var exitCode = exitCode || 0;

  queue.shutdown(0, function() {
    process.exit(exitCode);
  });
};

exports.log = function() {
  log('green', arguments);
};

exports.error = function() {
  log('red', arguments);
  exports.exit(1);
};

exports.warning = function() {
  log('yellow', arguments);
};

function log(color, args) {
  var format = Array.prototype.slice.call(args, 1);

  format.unshift(chalk[color](args[0]));

  console.log.apply(console, format);
}

