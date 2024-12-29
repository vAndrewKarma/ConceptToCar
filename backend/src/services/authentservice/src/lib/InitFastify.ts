import fastify,{FastifyInstance} from "fastify"
import helmet from '@fastify/helmet';
import start from "../helper/start";
export default async function fastify_loader() {
const server: FastifyInstance = fastify({ logger: true,  maxParamLength: 256, 
    trustProxy: true,
    bodyLimit: 1000000 })
    await server.register(helmet);
 // TODO: add cors
    await start(server)
    
return server
}  // TODO CHECK FOR SERVER REQUESTS TO SEE IF THERE ARE 2