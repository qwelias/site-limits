FROM node:18-alpine as build

WORKDIR /app

# do dependencies
COPY package*.json ./
COPY api/package.json ./api/
COPY api-schemas/package.json ./api-schemas/

RUN npm ci --only=production

# do build
COPY tsconfig.json .
COPY api ./api/
COPY api-schemas ./api-schemas/

RUN npm run build -w api-schemas -w api

FROM node:18-alpine

ENV NODE_ENV=production
COPY --from=build /app /app
WORKDIR /app

CMD ["npm", "-w", "api", "start"]
