# site-limits

## Prerequisites
- `NodeJS v18`+
- `docker`
- `docker-compose`

## Components
### API
See [`api/README.md`](api/README.md)

### API Schemas
See [`api-schemas/README.md`](api-schemas/README.md)

## Build/Run
### Development
1. `npm i`
1. `npm run build -w api-schemas -w api`
1. `npm run dev -w api`

### Deployment
See [`docker-compose.yaml`](docker-compose.yaml)

## TODO
use `turf.js`
