import dotenv from 'dotenv'

dotenv.config()

export default {
  app: {
    port: process.env.PORT || 50051,
    ENV: process.env.NODE_ENV || 'developmennt',
    DB: process.env.MONGO_DB || 'mongodb://keys-mongo-srv:27017/keys',
    MQ: process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672',
    REDIS: process.env.REDIS_HOST || 'redis://keys-redis-srv:6379',
    SECRET_KEY: process.env.SECRET_KEY || 'teapa',
  },
}
