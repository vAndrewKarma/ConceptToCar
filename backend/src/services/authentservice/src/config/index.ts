import dotenv from 'dotenv'

dotenv.config()

export default {
  app: {
    port: process.env.PORT || 50051,
    ENV: process.env.NODE_ENV || 'developmennt',
    DB:
      process.env.MONGO_DB || 'mongodb://auth-mongo-srv:27017/authenthication',
    MQ: process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672',
    REDIS: process.env.REDIS_HOST || 'redis://auth-redis-srv:6379',
  },
}
