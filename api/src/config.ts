import { err } from 'pino-std-serializers'

export const config = {
    mongo: {
        url: process.env['MONGO_URL'] || 'mongodb://root:pass@localhost:27017/site_limits?authSource=admin'
    },
    port: Number(process.env['BIND_PORT']) || 8085,
    address: process.env['BIND_IP'] || '0.0.0.0',
    logger: {
        base: {
            env: process.env['DD_ENV'] || process.env['NODE_ENV'] || 'production',
            source: 'manual',
            service: process.env['npm_package_name'],
            version: process.env['npm_package_version'],
        },
        level: process.env['PINO_MIN_LEVEL'] || 'info',
        serializers: {
            error: err,
        },
        formatters: {
            level: (status: string) => ({ status }),
        },
        timestamp: () => `,"timestamp":${new Date().toISOString()}`,
        messageKey: 'message',
        errorKey: 'error',
        redact: ['ctx.config.mongo.*'],
    }
}


export const openapi = {
    routePrefix: '/openapi',
    swagger: {
        info: {
            title: 'site-limits-api',
            description: process.env['npm_package_description'],
            version: process.env['npm_package_version'] || ''
        },
        basePath: '/',
    },
    hideUntagged: false,
    exposeRoute: true
}
