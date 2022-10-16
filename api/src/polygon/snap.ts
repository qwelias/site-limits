import type { Polygon } from 'site-limits-api-schemas/v1'
import { distance } from './intersect'

/**
 *
 * @param polygons
 * @param priorities
 * @param epsilon
 */
export const snap = (
    polygons: Polygon[],
    priorities: number[],
    epsilon: number = 0.0001,
) => {
    const verticeMap = polygons.flatMap((polygon, i) => polygon.map((p) => ({ p, i })))

    let snapped = false
    do {
        snapped = false
        for (const a of verticeMap) for (const b of verticeMap) {
            if (a === b) continue
            if (a.p.x === b.p.x && a.p.y === b.p.y) continue
            if (distance(a.p, b.p) > epsilon) continue

            snapped = true
            if (priorities[a.i]! < priorities[b.i]!) {
                a.p.x = b.p.x
                a.p.y = b.p.y
            } else {
                b.p.x = a.p.x
                b.p.y = a.p.y
            }
        }
    } while (snapped)

    // TODO: check for merged points within each polygon
}
