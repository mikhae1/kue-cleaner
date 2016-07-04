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
