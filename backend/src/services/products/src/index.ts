/* This app is powered by Fastify and created by © Karma Devs 2025. 
Backend members: (karma_andrew_, nana2237)
DevOps: (karma_andrew_)
AI: (nana2237)
Data Science: (nana2237)
QA: (karma_andrew_)
Project Manager: (karma_andrew_)
Frontend members: (iustin10, karma_andrew_ )
Security: (karma_andrew_)
Testers: (karma_andrew_) TODO: create tests, had only one on the testing cluster on the health endpoint


██████  ██████  ██   ██       ██ ████████      ██████  ██████  ███    ██ ████████ ███████ ███████ ████████ 
██   ██ ██   ██  ██ ██        ██    ██        ██      ██    ██ ████   ██    ██    ██      ██         ██    
██   ██ ██████    ███   █████ ██    ██        ██      ██    ██ ██ ██  ██    ██    █████   ███████    ██    
██   ██ ██   ██  ██ ██        ██    ██        ██      ██    ██ ██  ██ ██    ██    ██           ██    ██    
██████  ██   ██ ██   ██       ██    ██         ██████  ██████  ██   ████    ██    ███████ ███████    ██    
                                                                                                           
           
For any questions regarding de project you can message one of the Project Managers or the DevOps directly.
Contributions are closed for now, but we will open them in the future.
Don't forget to star the repoooooo :D
*/

import loader from './lib/loader'
import shutdown from '@karma-packages/conceptocar-common/dist/helper/shutdown'
;(async () => {
  const server = await loader()

  const shutdownHandler = async () => await shutdown(server)

  //listeners
  process.once('SIGTERM', shutdownHandler)
  process.once('SIGINT', shutdownHandler)
})()
