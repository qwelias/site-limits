import Fastify from 'fastify'
import { config, openapi } from './config'
import { routes } from './v1'
import { logger } from './logger'
import traps from '@dnlup/fastify-traps'
import { fastifySwagger } from '@fastify/swagger'

logger.info({ ctx: { config } }, 'Startup')

const fastify = Fastify({
    logger,
})

fastify.register(traps)
fastify.register(fastifySwagger, openapi)
fastify.register(routes)

fastify.listen({ port: config.port, host: config.address }).catch(e => {
    logger.error(e, 'Startup failed')
    process.exit(1)
})
