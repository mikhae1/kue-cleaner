// exports.error = function(err, exitcode) {
//   log('red', arguments);

//   console.log('Usage: deploy <enviroment> <task> [target]');

//   process.exit(1);
// };

exports.kueStates = ['active', 'inactive', 'complete', 'delayed', 'failed'];

exports.exit = function(queue, exitCode) {
  var exitCode = exitCode || 0;

  queue.shutdown(0, function() {
    process.exit(exitCode);
  });
};

