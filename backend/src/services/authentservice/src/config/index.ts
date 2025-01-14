import dotenv from 'dotenv'

dotenv.config()

export default {
  app: {
    port: process.env.PORT || 50051,
    ENV: process.env.NODE_ENV || 'not   wk ',
    DB:
      process.env.MONGO_DB || 'mongodb://auth-mongo-srv:27017/authenthication',
  },
}
