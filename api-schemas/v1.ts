import type { Schema } from '@coobaha/typed-fastify'

export interface SiteLimitsAPISchema extends Schema {
    paths: {
        'POST /v1/site': {
            request: {
                body: {
                    name: string
                    building_limits: Polygon[]
                    height_plateaus: Plateau[]
                }
            }
            response: {
                201: {
                    content: SiteData
                }
                400: {}
            }
        }
        'PATCH /v1/site/:id': {
            request: {
                body: {
                    modifiedAt: string // used to ckeck if in sync
                    name?: string
                    building_limits?: Polygon[]
                    height_plateaus?: Plateau[]
                }
            }
            response: {
                200: {
                    content: SiteData
                }
                404: {}
                400: {}
            }
        }
        'GET /v1/site/:id': {
            response: {
                200: {
                    content: SiteData
                }
                404: {}
            }
        }
    }
}

export type SiteData = {
    _id: string
    name: string
    createdAt: string
    modifiedAt: string
    building_limits: Polygon[]
    height_plateaus: Plateau[]
    building_plateaus: Plateau[]
}

export type Plateau = { polygon: Polygon, height: number }

export type Polygon = [Point, Point, Point, ...Point[]] // at least 3 points as in triangle

export type Point = { x: number, y: number }
