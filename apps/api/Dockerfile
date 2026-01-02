# syntax=docker/dockerfile:1
FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

# =============================================================================
# 1) Production deps (no prune, no scripts)
# =============================================================================
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/config/package.json ./packages/config/
COPY packages/types/package.json ./packages/types/
COPY packages/ui/package.json ./packages/ui/
COPY packages/utils/package.json ./packages/utils/
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# =============================================================================
# 2) Builder (dev deps + build + prisma generate)
# =============================================================================
FROM base AS builder
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/config/package.json ./packages/config/
COPY packages/types/package.json ./packages/types/
COPY packages/ui/package.json ./packages/ui/
COPY packages/utils/package.json ./packages/utils/
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/api/ ./apps/api/
COPY packages/ ./packages/

# Generate Prisma client
RUN pnpm --filter ./apps/api... exec prisma generate

# Build the API
RUN pnpm --filter ./apps/api... build

# =============================================================================
# 3) Final runtime
# =============================================================================
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install curl for health checks
RUN apk add --no-cache curl

# Copy node_modules from deps (has express and all prod deps)
COPY --from=deps /app/node_modules ./node_modules

# Copy dist to /app/dist (where the code expects it)
COPY --from=builder /app/apps/api/dist ./dist

# Copy Prisma schema and generated client
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/apps/api/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/apps/api/node_modules/@prisma ./node_modules/@prisma

# Copy package.json for module resolution
COPY --from=builder /app/apps/api/package.json ./package.json

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "dist/index.js"]
