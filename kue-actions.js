#!/usr/bin/env node

var kue = require('kue');
var lib = require('./lib');

var targets = {
  'flow:test': {
    redis: 'redis://uds-redis-test-clu01:6379/1',
    prefix: '{q}'
  },
  'flow:dev': {
    redis: 'redis://uds-redis-dev:6379/2',
  },
};

var argv = require('yargs')
  .usage('Usage: $0 <target> <task> [options]')
  .demand(2)
  .help('help')
  .argv;

var target = targets[argv._.shift()];
var task = argv._.shift();

var queue = kue.createQueue({
  redis: target.redis,
  prefix: target.prefix || 'q'
});

queue.on('error', function(err) {
  lib.error(err);
  lib.exit(queue);
});

lib.init(queue);

require('./tasks/' + task + '.js')(queue, argv);
