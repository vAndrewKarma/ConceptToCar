/*

 __           ___ __                       
|__)||\ ||_/   | |_  /\ |\/|               
| \ || \|| \   | |__/--\|  |               
                                           
 __  __       ___   __ __     ___ __ _____ 
|  \|__)\_/  | |   /  /  \|\ | | |_ (_  |  
|__/| \ / \  | |   \__\__/| \| | |____) |  
                                           

*/
import loader from './lib/loader'
import shutdown from './helper/shutdown'
;(async () => {
  const server = await loader()

  const shutdownHandler = async () => await shutdown(server)

  //listeners
  process.once('SIGTERM', shutdownHandler)
  process.once('SIGINT', shutdownHandler)
})()

//TODO VERY IMPORTANT MAKE DEV AND PROD ENVIRONMENT FOR REDIS MONGO AND SESSIONS + RABBITMQ
