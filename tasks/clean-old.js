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
module.exports = function(queue, yargs) {
  var argv = yargs
    .usage('Usage: $0 clean <taskStatus> <taskName>')
    .demand(3)
    .help('help')
    .argv;

  state = argv._[2];
  var cbCount = 0;

  if (!state) {
    console.error('You should specify jobs state: ', lib.kueStates);
    lib.exit(1);
  }

  if (argv._.length > 3) type = argv._[3];

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
                done();
              }
            });
          }
        }

        function done() {
          var timeout = parseInt((total / 10000) * 2 * 1000);

          // https://github.com/Automattic/kue#job-cleanup
          console.log(chalk.yellow('Waiting ' + timeout +
            'ms to .remove() call to complete before the process exits'));
          return setTimeout(function() {
            console.log(chalk.green('Task complete!'));
            lib.exit();
          }, timeout);
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
