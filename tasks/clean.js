var kue = require('kue');
var inquirer = require('inquirer');
var lib = require('../lib');
var chalk = require('chalk');

var CHUNK_SIZE = 10000;
var CHUNK_TIMEOUT = 1000;

/**
 * Стирает все задачи с определенным статусом (status)
 * если тип (type) указан, стирает только определенного типа
 * FIXME: Нужно удалять частями и потом делать паузу через каждые 10 000
 */
module.exports = function(queue, yargs) {
  var argv = yargs
    .usage('Usage: $0 clean-chunks [jobType] [options]')
    .option('t', {
      alias: 'type',
      describe: 'Job type'
    })
    .option('s', {
      alias: 'state',
      describe: 'Job status',
      default: 'failed'
    })
    .help('help')
    .argv;

  var removedJobs = 0;
  countJobs(function(err, totalJobs) {
    if (err) return lib.error(err);

    var msg = 'Clean ' + totalJobs + ' records {status: "' +
      argv.state + '", type: "' + (argv.type || 'all') + '"}?';

    inquirer.prompt([{
      type: 'confirm',
      message: msg,
      name: 'confirm'
    }], function(ans) {
      if (!ans.confirm) {
        console.log(chalk.yellow('Stopped by user'));
        return lib.exit();
      }

      loop();

      function loop() {
        chunkProcess(function(err) {
          if (err) return lib.error(err);

          console.log(chalk.cyan('Total jobs removed: (%d/%d)'), removedJobs, totalJobs);

          if (removedJobs >= totalJobs) return done();

          console.log(chalk.yellow('waiting for %s ms to continue'), CHUNK_TIMEOUT);
          setTimeout(loop, CHUNK_TIMEOUT);
        });
      }

      function chunkProcess(next) {
        var cbCount = 0;
        var fn = kue.Job.rangeByState;
        var fnArgv = [argv.state, 0, CHUNK_SIZE - 1, 'asc', searchComplete];
        if (argv.type) {
          fn = kue.Job.rangeByType;
          fnArgv.splice(0, 0, argv.type);
        }

        fn.apply(kue, fnArgv);

        function searchComplete(err, jobs) {
          if (err) return next(err);

          if (jobs.length === 0) return next(null);

          var job;
          for (var i = 0; i < jobs.length; i++) {
            cbCount++;
            job = jobs[i];
            job.remove(callback);
          }

          function callback(err) {
            if (err) return next(err);

            removedJobs++;
            console.log('job removed: #%d {state: "%s", type: "%s"} (%d/%d)',
              job.id, argv.state, job.type, removedJobs, totalJobs);

            if (!--cbCount) return next(null);
          }
        }
      }

      function done() {
        console.log(chalk.green('Task complete!'));
        lib.exit();
      }
    });
  });

  function countJobs(cb) {
    var fn = queue[argv.state + 'Count'];
    var fnArgv = [cb];
    if (argv.type) fnArgv.splice(0, 0, argv.type);

    //queue[argv.state + 'Count'](cb);
    fn.apply(queue, fnArgv);
  }
};
