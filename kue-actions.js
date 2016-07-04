#!/usr/bin/env node

var kue = require('kue');
var Redis = require('ioredis');

var lib = require('./lib');
var config = require('./config');

var argv = require('yargs')
  .usage('Usage: $0 <target> <task> [options]')
  .demand(2)
  .help('help')
  .argv;

var targets = config.targets;
var target = targets[argv._.shift()];
var task = argv._.shift();

var queue = create(target);

queue.on('error', function(err) {
  lib.error(err);
  lib.exit(queue);
});

lib.init(queue);

require('./tasks/' + task + '.js')(queue, argv);

// always use ioredis! (nd-queue default)
function create(config) {
  return kue.createQueue({
    prefix: config.prefix,

    redis: {
      createClientFactory: function() {
        return new Redis(config.redis);
      }
    }
  });
}
