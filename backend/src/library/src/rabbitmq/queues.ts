export const rabbitConfig = {
  queues: {
    AUTH_CREATE_USER_SESSION: {
      name: 'auth.createSession',
      options: {
        durable: true,
        autoDelete: false,
        arguments: {
          //   'x-dead-letter-exchange': 'dlx_exchange',
          'x-message-ttl': 60000,

          'x-expires': 3600000,
        },
      },
    },
  },

  //   dlx_exchange: {
  //     name: 'dlx_exchange',
  //     type: 'direct',
  //     options: {
  //       durable: true,
  //     },
  //   },

  //   dlx_queue: {
  //     name: 'dlx_queue',
  //     options: {
  //       durable: true,
  //       autoDelete: false,
  //     },
  //   },
}
