import dotenv from 'dotenv'

dotenv.config()

export default {
  app: {
    port: process.env.PORT || 50051,
  },
}
