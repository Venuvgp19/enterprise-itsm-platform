FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY packages/db/package*.json ./packages/db/
COPY packages/shared-types/package*.json ./packages/shared-types/

RUN npm install

COPY packages/ ./packages/
COPY apps/backend/ ./apps/backend/

RUN npm run build:db
RUN npm run build:backend

FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/package.json ./apps/backend/package.json

EXPOSE 4000
CMD ["node", "apps/backend/dist/main"]
