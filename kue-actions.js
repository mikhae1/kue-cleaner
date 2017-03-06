#!/usr/bin/env node

var kue = require('kue');
var Redis = require('ioredis');
var path = require('path');
var fs = require('fs');

var lib = require('./lib');
var config = require('./config');

let tasks = initTasks('./tasks');
let envs = Object.keys(config.targets);
function initArgs(yargs, envs, tasks) {
  function taskArgs(yargs) {
    tasks.forEach(task => {
       yargs.command(task, 'task');
    });

    yargs.commandDir('./tasks');
  }

  envs.forEach(env => {
    yargs.command(env, 'environment', taskArgs);
  });
}

var yargs = require('yargs')
  .usage('Usage: $0 <target> <task> [options]')
  .completion('completions')
  .alias('h', 'help')
  .help();

initArgs(yargs, envs, tasks);

var argv = yargs.argv;
var targets = config.targets;
var target = argv._.shift();
var task = argv._.shift();

if (!target) return error('no target defined');
if (!task) return error('no task specified');

if (!targets.hasOwnProperty(target)) return error('unknown target ' + target);

var taskPath = './' + path.join('tasks', task + '.js');

try {
  fs.accessSync(taskPath);
} catch (e) {
  error('task "%s" not found at %s', task, taskPath);
}

var config = targets[target];
var queue = create(config);

queue.on('error', function(err) {
  lib.error(err);
  lib.exit(queue);
});

lib.init(queue);

require(taskPath).run(queue, argv);

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
  lib.warning.apply(lib.warning, Array.prototype.slice.call(arguments));

  process.exit(1);
}

function initTasks(_path) {
  let files = fs.readdirSync(_path);

  let out = [];

  files.forEach(file => {
    if (!file.includes('.js')) return;

    out.push(file.split('.js')[0]);
  });

  return out;
}
