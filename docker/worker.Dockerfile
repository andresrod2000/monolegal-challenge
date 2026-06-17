# ── Stage 1: Dependencies (packages only) ──
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY scripts/docker-install-deps.js scripts/link-workspaces.js ./scripts/
COPY packages/shared/package.json ./packages/shared/
COPY packages/domain/package.json ./packages/domain/
COPY packages/application/package.json ./packages/application/
COPY packages/infrastructure/package.json ./packages/infrastructure/
RUN node scripts/docker-install-deps.js

# ── Stage 2: Build ──
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app ./
COPY . .
RUN node scripts/link-workspaces.js \
  && npm install --ignore-scripts --prefix apps/worker \
  && npm run build:packages \
  && npm run build --prefix apps/worker

# ── Stage 3: Production ──
FROM node:20-alpine AS production
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/apps/worker/dist ./apps/worker/dist
COPY --from=build /app/apps/worker/package.json ./apps/worker/package.json
COPY --from=build /app/packages/shared/dist ./packages/shared/dist
COPY --from=build /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=build /app/packages/domain/dist ./packages/domain/dist
COPY --from=build /app/packages/domain/package.json ./packages/domain/package.json
COPY --from=build /app/packages/application/dist ./packages/application/dist
COPY --from=build /app/packages/application/package.json ./packages/application/package.json
COPY --from=build /app/packages/infrastructure/dist ./packages/infrastructure/dist
COPY --from=build /app/packages/infrastructure/package.json ./packages/infrastructure/package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages/infrastructure/node_modules ./packages/infrastructure/node_modules
COPY --from=build /app/apps/worker/node_modules ./apps/worker/node_modules
COPY --from=build /app/package.json ./package.json

USER nodejs
WORKDIR /app/apps/worker
CMD ["node", "dist/main.js"]
