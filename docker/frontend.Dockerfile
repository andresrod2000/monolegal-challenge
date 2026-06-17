# ── Stage 1: Dependencies (shared package only) ──
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY scripts/docker-install-deps.js scripts/link-workspaces.js ./scripts/
COPY packages/shared/package.json ./packages/shared/
RUN node scripts/docker-install-deps.js

# ── Stage 2: Build ──
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app ./
COPY . .
ARG NEXT_PUBLIC_API_URL=http://api.monolegal.local
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN node scripts/link-workspaces.js \
  && npm install --ignore-scripts --prefix apps/frontend \
  && npm run build --prefix packages/shared \
  && npm run build --prefix apps/frontend

# ── Stage 3: Production ──
FROM node:20-alpine AS production
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/apps/frontend/.next/standalone ./
COPY --from=build /app/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=build /app/apps/frontend/public ./apps/frontend/public

USER nodejs
EXPOSE 3000
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
CMD ["node", "apps/frontend/server.js"]
