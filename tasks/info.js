var lib = require('../lib');

var kueStates = lib.kueStates;
var TIMEOUT = 3000;

module.exports = function(queue, argv) {
  if (argv.r) {
    setInterval(function() {
      getInfo(queue, done);
    }, 1000);
  } else {
    setTimeout(function() {
      lib.error(new Error('ETIMEOUT'));
      lib.exit(1);
    }, TIMEOUT);
  }

  getInfo(queue, done);

  function done(err, info) {
    if (err) return lib.error(err);

    for (var key in info) {
      console.log(key + ':', info[key]);
    }

    if (!argv.r) lib.exit();
  }
};

function getInfo(queue, cb) {
  var info = {},
    qcount = 0;

  kueStates.forEach(function(type) {
    qcount++;
    queue[type + 'Count'](function(err, count) {
      if (err) return cb(err);

      qcount--;
      info['Total ' + type] = count;
    });
  });

  // per type stats
  queue.types(function(err, types) {
    if (err) return cb(err);

    types.forEach(function(type) {
      kueStates.forEach(function(state) {
        qcount++;
        queue.cardByType(type, state, function(err, count) {
          if (err) return cb(err);

          info[type + ' ' + state] = count;

          if (--qcount === 0) cb(null, info);
        });
      });
    });
  });
}
