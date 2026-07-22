FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY apps/frontend/package*.json ./apps/frontend/
COPY packages/shared-types/package*.json ./packages/shared-types/

RUN npm install

COPY packages/ ./packages/
COPY apps/frontend/ ./apps/frontend/

ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build:frontend

FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED 1

COPY --from=builder /app/apps/frontend/.next ./apps/frontend/.next
COPY --from=builder /app/apps/frontend/public ./apps/frontend/public
COPY --from=builder /app/apps/frontend/package.json ./apps/frontend/package.json
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["npm", "--prefix", "apps/frontend", "start"]
