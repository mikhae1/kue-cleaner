var kue = require('kue');
var inquirer = require('inquirer');
var lib = require('../lib');


module.exports = function(queue, argv) {


  kue.Job.rangeByType('findRelations', 'complete', 0, Math.pow(10,10), 'asc', function(err, selectedJobs) {
    console.log(selectedJobs.length);

    process.exit();
  });
};