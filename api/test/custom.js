import { makeSetch, mime } from 'setch'

const fetch = makeSetch('http://80.87.111.227:8085/v1/site',
    {
        headers: { accept: mime.json, 'content-type': mime.json }
    },
)

const res = await fetch('',
    {
        method: 'POST',
        body: JSON.stringify({
            name: 'foo',
            building_limits: [[
                {x: 0, y: 0},
                {x: 100, y: 0},
                {x: 200, y: 200},
                {x: 0, y: 100},
            ]],
            height_plateaus: [{
                polygon: [
                    {x: 0, y:0 },
                    {x: 100, y:0 },
                    {x: 100, y:100 },
                ],
                height: 5,
            }, {
                polygon: [
                    {x:0, y:0},
                    {x:0, y:100},
                    {x:100, y:100},
                ],
                height: 2,
            }]
        })
    },
).then(r => r.json())

console.log(res)
