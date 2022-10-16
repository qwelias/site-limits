import addSchema, { Service } from '@coobaha/typed-fastify'
import type { FastifyPluginCallback } from 'fastify'
import * as jsonSchema from 'site-limits-api-schemas/v1.gen.json'
import type { SiteLimitsAPISchema, Polygon, Plateau, SiteData } from 'site-limits-api-schemas/v1'
import { mc } from './mongo'
import { snap } from './polygon/snap'
import { intersect } from './polygon/intersect'
import { HTTPError } from './http-error'

export const routes: FastifyPluginCallback = async (fastify) => {
    await mc.connect()
    addSchema(fastify, { jsonSchema, service })
}

const service: Service<SiteLimitsAPISchema> = {
    'GET /v1/site/:id': async (req, reply) => {
        const site = await mc.db().collection('sites').findOne({ _id: req.params.id })
        if (!site) throw new HTTPError('Not Found', 404)
        return reply.status(200).send(site as unknown as SiteData)
    },
    'POST /v1/site': async (req, reply) => {
        const { name, building_limits, height_plateaus } = req.body

        const building_plateaus = checkAndCalcHeightLimits(building_limits, height_plateaus)

        const site = {
            createdAt: new Date(),
            modifiedAt: new Date(),
            name,
            building_plateaus,
            building_limits,
            height_plateaus,
        }
        const { insertedId } = await mc.db().collection('sites').insertOne(site)
        return reply.status(201).send({ ...site, _id: insertedId } as unknown as SiteData)
    },
    'PATCH /v1/site/:id': async (req, reply) => {
        if (Object.keys(req.body).length < 2) throw new HTTPError('Nothing to update', 400)

        const site = await mc.db().collection('sites').findOne({ _id: req.params.id })
        if (!site) throw new HTTPError('Not Found', 404)
        if (String(site.modifiedAt) !== req.body.modifiedAt) throw new HTTPError('Site out of sync', 409)

        const name = req.body.name ?? site.name as string
        if (!req.body.building_limits && !req.body.height_plateaus) {
            const update = { name, modifiedAt: new Date() }
            const { modifiedCount } = await mc.db().collection('sites').updateOne(
                { _id: req.params.id, modifiedAt: new Date(req.body.modifiedAt) },
                { $set: update },
            )
            if (!modifiedCount) throw new HTTPError('Site out of sync', 409)
            return reply.status(200).send({ ...site, ...update } as unknown as SiteData)
        }

        const building_limits = req.body.building_limits ?? site.building_limits as Polygon[]
        const height_plateaus = req.body.height_plateaus ?? site.height_plateaus as Plateau[]
        const building_plateaus = checkAndCalcHeightLimits(building_limits, height_plateaus)
        const update = {
            modifiedAt: new Date(),
            name,
            building_plateaus,
            building_limits,
            height_plateaus,
        }
        const { modifiedCount } = await mc.db().collection('sites').updateOne(
            { _id: req.params.id, modifiedAt: new Date(req.body.modifiedAt) },
            { $set: update },
        )
        if (!modifiedCount) throw new HTTPError('Site out of sync', 409)
        return reply.status(200).send({ ...site, ...update } as unknown as SiteData)
    },
}

const checkAndCalcHeightLimits = (building_limits: Polygon[], height_plateaus: Plateau[]) => {
    snapInputs(building_limits, height_plateaus)
    if (!checkNoIntersections(building_limits)) {
        throw new HTTPError('building_limits intersect each other', 400)
    }
    if (!checkNoIntersections(height_plateaus.map(p => p.polygon))) {
        throw new HTTPError('height_plateaus intersect each other', 400)
    }

    const building_plateaus: Plateau[] = []
    for (const bl of building_limits) for (const hp of height_plateaus) {
        const polygons = intersect(bl, hp.polygon) as Polygon[] | false
        if (polygons) building_plateaus.push(
            ...polygons.map(polygon => ({ polygon, height: hp.height }))
        )
    }
    if (!building_plateaus.length) throw new HTTPError('height_plateaus do not intersect building_limits', 400)
    return building_plateaus
}

const checkNoIntersections = (polygons: Polygon[]) => {
    for (const a of polygons) for (const b of polygons) {
        if (a === b) continue
        if (intersect(a, b).length) return false
    }
    return true
}

const snapInputs = (building_limits: Polygon[], height_plateaus: Plateau[]) => {
    const polygons = [
        ...building_limits,
        ...height_plateaus.map(p => p.polygon),
    ]
    const priorities = [
        ...new Array(building_limits.length).fill(Number.MAX_SAFE_INTEGER),
        ...height_plateaus.map(p => Number.MAX_SAFE_INTEGER - p.height)
    ]
    snap(polygons, priorities)
}
