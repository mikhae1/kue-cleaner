module.exports = {
  targets: {
    'orchid:prod': {
      redis: {
        db: 1,
        name: 'redis-cluster',
        sentinels: [{
          host: "ec001-redis01.e-c.io",
          port: 16379
        }, {
          host: "ec001-redis02.e-c.io",
          port: 16379
        }, {
          host: "ec001-redis03.e-c.io",
          port: 16379
        }]
      },
      //prefix: '{q}'
    },
    'orchid:prod2': {
      redis: {
        db: 10,
        name: 'redis-cluster',
        sentinels: [{
          host: "ec001-redis01.e-c.io",
          port: 16379
        }, {
          host: "ec001-redis02.e-c.io",
          port: 16379
        }, {
          host: "ec001-redis03.e-c.io",
          port: 16379
        }]
      },
      //prefix: '{q}'
    },
    'koala:prot': {
      redis: {
        db: 2,
        name: 'redis-cluster',
        sentinels: [{
          host: 'uds-suek-redis01',
          port: 16379
        }, {
          host: 'uds-suek-redis02',
          port: 16379
        }, {
          host: 'uds-suek-redis03',
          port: 16379
        }]
      },
      //prefix: '{q}'
    },
    'flow:prod': {
      redis: {
        db: 4,
        name: 'redis-cluster',
        sentinels: [{
          host: 'uds-redis-clu01',
          port: 16379
        }, {
          host: 'uds-redis-clu02',
          pprt: 16379
        }, {
          host: 'uds-redis-clu03',
          port: 16379
        }]
      },
      //}refix: '{q}'
    },
    'flow:staging': {
      redis: {
        db: 9,
        name: 'redis-cluster',
        sentinels: [{
          host: 'uds-redis-test-clu01',
          port: 16379
        }, {
          host: 'uds-redis-test-clu02',
          pprt: 16379
        }, {
          host: 'uds-redis-test-clu03',
          port: 16379
        }]
      },
      //}refix: '{q}'
    },
    'flow:vision': {
      redis: {
        db: 25,
        name: 'redis-cluster',
        sentinels: [{
          host: 'uds-redis-test-clu01',
          port: 16379
        }, {
          host: 'uds-redis-test-clu02',
          pprt: 16379
        }, {
          host: 'uds-redis-test-clu03',
          port: 16379
        }]
      },
      //}refix: '{q}'
    },
    'orchid:test': {
      redis: 'redis://ec001-redis-test.e-c.io:6379/1',
    },
    'flow:dev': {
      redis: 'redis://uds-redis-dev:6379/2',
    },
    'local': {
      redis: 'redis://localhost/0',
      // prefix: 'q'
    },
  }
};
