var lib = require('../lib');
var chalk = require('chalk');

var CHUNK_LENGTH = 10000;
var CHUNK_TIMEOUT = 1000;

module.exports = function(queue, yargs) {

  var argv = yargs
    .usage('Usage: $0 create <taskName> [options]')
    .demand(3)
    .option('n', {
      alias: 'total',
      type: 'number',
      describe: 'Number of jobs to be created',
      default: 100
    })
    .help('help')
    .argv;

  var jobType = argv._[2];
  var total = parseInt(argv.total, 10);

  console.log(chalk.cyan('Preparing to create %d dummy jobs...'), total);

  var totalJobs = total;
  var jobs = 0;

  loop();

  function loop() {
    if (totalJobs <= 0) return done();

    jobs = CHUNK_LENGTH;
    if (totalJobs < CHUNK_LENGTH) jobs = totalJobs;

    creator(jobs, function() {
      totalJobs -= jobs;
      console.log('jobs added {state: "%s", type: "%s"} (%d/%d)',
        'inactive', jobType, total - totalJobs, total);

      console.log(chalk.yellow('waiting for %s ms'), CHUNK_TIMEOUT);

      // https://github.com/Automattic/kue#job-cleanup
      setTimeout(loop, CHUNK_TIMEOUT);
    });
  }

  function creator(amount, next) {
    var cbCount = 0;
    for (var i = 0; i < amount; i++) {
      cbCount++;
      queue.create(jobType, {
        title: 'Test Job',
        ts: new Date()
      }).save(callback);
    }

    function callback(err) {
      if (err) throw err;

      if (!--cbCount) next();
    }
  }

  function done() {
    console.log(chalk.green('Task complete!'));
    lib.exit();
  }
};
