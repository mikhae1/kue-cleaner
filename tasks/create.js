var lib = require('../lib');
var chalk = require('chalk');

var CHUNK_SIZE = 10000;
var CHUNK_TIMEOUT = 1000;

exports.command = 'create';

exports.desc = 'Create dummy jobs for testing';

exports.builder = (yargs) => {
  yargs
    .usage('Usage: $0 <env> create <taskName> [options]')
    .demand(1)
    .option('n', {
      alias: 'total',
      type: 'number',
      describe: 'Number of jobs to be created',
      default: 100
    })
    .option('t', {
      alias: 'title',
      describe: 'Job title',
      default: 'Test Job Title'
    })
    .option('s', {
      alias: 'state',
      describe: 'Job status',
      default: 'inactive'
    });
};

exports.run = function(queue, argv) {
  var jobType = argv._[2];
  var total = parseInt(argv.total, 10);

  console.log(chalk.cyan('Preparing to create %d dummy jobs...'), total);

  var jobsToCreate = total;
  var jobs = 0;

  loop();

  function loop() {
    if (jobsToCreate <= 0) return done();

    jobs = CHUNK_SIZE;
    if (jobsToCreate < CHUNK_SIZE) jobs = jobsToCreate;

    chunkProcess(jobs, function() {
      jobsToCreate -= jobs;
      console.log('jobs added {state: "%s", type: "%s"} (%d/%d)',
        argv.state, jobType, total - jobsToCreate, total);

      console.log(chalk.yellow('waiting for %s ms to continue'), CHUNK_TIMEOUT);

      // https://github.com/Automattic/kue#job-cleanup
      setTimeout(loop, CHUNK_TIMEOUT);
    });
  }

  function chunkProcess(chunkSize, next) {
    var cbCount = 0;
    for (var i = 0; i < chunkSize; i++) {
      cbCount++;
      queue.create(jobType, {
        title: argv.t,
        ts: new Date()
      }).save(callback);
    }

    function callback(err) {
      if (err) return lib.error(err);

      if (!--cbCount) next();
    }
  }

  function done() {
    console.log(chalk.green('Task complete!'));
    lib.exit();
  }
};
