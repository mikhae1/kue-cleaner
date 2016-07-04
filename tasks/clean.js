var kue = require('kue');
var inquirer = require('inquirer');
var lib = require('../lib');
var chalk = require('chalk');

var type, state;

/**
 * Стирает все задачи с определенным статусом (status)
 * если тип (type) указан, стирает только определенного типа
 * FIXME: Нужно удалять частями и потом делать паузу через каждые 10 000
 */
module.exports = function(queue, argv) {
  state = argv._[0];
  var cbCount = 0;

  if (!state) {
    console.error('You should specify jobs state: ', lib.kueStates);
    lib.exit(1);
  }

  if (argv._.length > 1) type = argv._[1];

  queue[state](function(err, ids) {
    countJobs(ids, function(err, total) {
      inquirer.prompt([{
        type: 'confirm',
        message: 'Clean "' + state + '" ' + total + ' records?',
        name: 'confirm'
      }], function(ans) {
        if (!ans.confirm) {
          console.log(chalk.yellow('Task was stopped by user'));
          return lib.exit();
        }

        for (var i = 0; i < ids.length; i++) {
          kue.Job.get(ids[i], processor);
        }

        function processor(err, job) {
          if (!type || job.type === type) {
            cbCount++;
            job.remove(function(err) {
              if (err) throw err;

              console.log('removed job #%d {state: "%s", type: "%s"} (%d/%d)',
                job.id, state, job.type, total - cbCount + 1, total);

              if (!--cbCount) {
                console.log(chalk.green('Task complete!'));
                return lib.exit();
              }
            });
          }
        }
      });
    });
  });
};

function countJobs(ids, cb) {
  if (!type) return cb(null, ids.length);

  var count = 0;
  var cbCount = 0;
  for (var i = 0; i < ids.length; i++) {
    cbCount++;
    kue.Job.get(ids[i], processor);
  }

  function processor(err, job) {
    if (err) return cb(err);

    if (job.type === type) count++;

    if (!--cbCount) return cb(null, count);
  }
}
