# ── Stage 1: Dependencies ──
FROM node:20-alpine AS deps
WORKDIR /app
COPY apps/frontend/package.json apps/frontend/package-lock.json* ./apps/frontend/
RUN npm ci --prefix apps/frontend

# ── Stage 2: Build ──
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/apps/frontend/node_modules ./apps/frontend/node_modules
COPY apps/frontend ./apps/frontend
RUN npm run build --prefix apps/frontend

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
