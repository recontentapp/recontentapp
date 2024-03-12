# Install dependencies
FROM node:18-alpine As development

WORKDIR /usr/src/app

COPY --chown=node:node package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY --chown=node:node . .

USER node

# Build
FROM node:18-alpine As build

WORKDIR /usr/src/app

COPY --chown=node:node package.json yarn.lock ./

COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules

COPY --chown=node:node . .

RUN yarn workspace api build

ENV NODE_ENV production

RUN yarn install --production && yarn cache clean

USER node

# Production
FROM node:18-alpine As production

COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/packages ./packages

CMD [ "node", "packages/api/dist/api.js" ]
