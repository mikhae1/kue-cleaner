var kue = require('kue');
var inquirer = require('inquirer');
var lib = require('../lib');


module.exports = function(queue, argv) {
 inquirer.prompt([{
    type: 'confirm',
    message: 'Flush all records?',
    name: 'confirm'
  }], function(ans) {
    if (!ans.confirm) {
      lib.warning('Task was stopped by user');
      return lib.exit(queue);
    }

    flush();
  });

 function flush() {


 }

}