# Install dependencies
FROM node:20-alpine As development

WORKDIR /usr/src/app

COPY --chown=node:node package.json yarn.lock ./
COPY --chown=node:node ./packages/api/package.json ./packages/api/package.json
COPY --chown=node:node ./packages/db/package.json ./packages/db/package.json
COPY --chown=node:node ./packages/db/schema.prisma ./packages/db/schema.prisma
COPY --chown=node:node ./packages/email-templates/package.json ./packages/email-templates/package.json
COPY --chown=node:node ./packages/design-system/package.json ./packages/design-system/package.json
COPY --chown=node:node ./packages/file-formats/package.json ./packages/file-formats/package.json
COPY --chown=node:node ./packages/app/package.json ./packages/app/package.json

RUN yarn install --frozen-lockfile

COPY --chown=node:node . .

USER node


# Build
FROM node:20-alpine As build

WORKDIR /usr/src/app

ENV VITE_APP_API_URL /private

COPY --chown=node:node package.json yarn.lock ./

COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=development /usr/src/app/packages/app/node_modules ./packages/app/node_modules
COPY --chown=node:node --from=development /usr/src/app/packages/api/node_modules ./packages/api/node_modules
COPY --chown=node:node --from=development /usr/src/app/packages/email-templates/node_modules ./packages/email-templates/node_modules
COPY --chown=node:node --from=development /usr/src/app/packages/design-system/node_modules ./packages/design-system/node_modules
COPY --chown=node:node --from=development /usr/src/app/packages/file-formats/node_modules ./packages/file-formats/node_modules
COPY --chown=node:node --from=development /usr/src/app/packages/db/node_modules ./packages/db/node_modules

COPY --chown=node:node . .

RUN yarn setup
RUN yarn workspace api build
RUN yarn workspace app build

USER node

# Production
FROM node:20-alpine As production

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV APP_VERSION=0.5.0
ENV APP_DISTRIBUTION=self-hosted
ENV SERVE_STATIC_FILES=true

COPY --chown=node:node package.json yarn.lock ./
COPY --chown=node:node ./packages/api/package.json ./packages/api/package.json
COPY --chown=node:node ./packages/file-formats/package.json ./packages/file-formats/package.json
COPY --chown=node:node ./packages/db/package.json ./packages/db/package.json
COPY --chown=node:node ./packages/db/schema.prisma ./packages/db/schema.prisma

RUN yarn install --production

RUN yarn workspace db generate

USER node

COPY --chown=node:node --from=build /usr/src/app/packages/api/dist ./packages/api/dist
COPY --chown=node:node --from=build /usr/src/app/packages/app/dist ./packages/app/dist
COPY --chown=node:node --from=build /usr/src/app/packages/email-templates/dist ./packages/email-templates/dist
COPY --chown=node:node --from=build /usr/src/app/packages/file-formats/dist ./packages/file-formats/dist
COPY --chown=node:node --from=build /usr/src/app/packages/db ./packages/db

CMD ["node", "packages/api/dist/api.js"]
