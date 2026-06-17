# ── Stage 1: Dependencies ──
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY scripts/install-workspaces.js scripts/link-workspaces.js ./scripts/
COPY packages/shared/package.json ./packages/shared/
COPY packages/domain/package.json ./packages/domain/
COPY packages/application/package.json ./packages/application/
COPY packages/infrastructure/package.json ./packages/infrastructure/
COPY apps/api/package.json ./apps/api/
RUN node scripts/install-workspaces.js

# ── Stage 2: Build ──
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app ./
COPY . .
RUN npm run build:packages && npm run build --prefix apps/api

# ── Stage 3: Production ──
FROM node:20-alpine AS production
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
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
COPY --from=build /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build /app/package.json ./package.json

USER nodejs
EXPOSE 4000
WORKDIR /app/apps/api
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:4000/health || exit 1
CMD ["node", "dist/main.js"]
