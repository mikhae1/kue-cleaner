#!/usr/bin/env node

var kue = require('kue');
var Redis = require('ioredis');
var chalk = require('chalk');

var lib = require('./lib');
var config = require('./config');
var path = require('path');
var fs = require('fs');

var yargs = require('yargs')
  .usage('Usage: $0 <target> <task> [options]');
  //.demand(2);

var argv = yargs.argv;
var targets = config.targets;
var target = argv._.shift();
var task = argv._.shift();

if (!target) return error('Define target');
if (!task) return error('Specify task');

if (!targets.hasOwnProperty(target)) return error('Unknown target');

var taskPath = path.join('tasks', task + '.js');

try {
  fs.accessSync(taskPath);
} catch (e) {
  error('Task "%s" not found at %s', task, taskPath);
}

var config = targets[target];
var queue = create(config);

queue.on('error', function(err) {
  lib.error(err);
  lib.exit(queue);
});

lib.init(queue);

require('./' + taskPath)(queue, yargs);

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

function error(err) {
  console.error(chalk.red(err));

  process.exit(1);
}
