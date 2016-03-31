var kue = require('kue');
var inquirer = require('inquirer');
var lib = require('../lib');


module.exports = function(queue, argv) {

  var state = argv._[0];
  if (!state) {
    console.error('you should specify jobs state: ', lib.kueStates);
    lib.exit(queue, 1);
  }

  // kue.Job.rangeByType ('job', 'failed', 0, 10, 'asc', function (err, selectedJobs) {

  queue[state](function(err, ids) {
    var total = ids.length;
    inquirer.prompt([{
      type: 'confirm',
      message: 'Clean "' + state + '" ' + total + ' records?',
      name: 'confirm'
    }], function(ans) {
      if (!ans.confirm) {
        console.log('task was stopped by user');
        return lib.exit(queue);
      }

      var count = 0;
      ids.forEach(function(id) {
        kue.Job.get(id, function(err, job) {
          // Your application should check if job is a stuck one
          console.log('removing job #' + id + '...');
          count++;
          job.remove(function(err) {
            if (err) throw err;

            console.log('removed "' + state + '" job #%d (%d/%d)', job.id, total - count + 1, total);

            if (!--count) {
              console.log('All done!');
              return lib.exit(queue);
            }
          });
        });
      });
    });
  });
};
