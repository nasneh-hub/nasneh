# syntax=docker/dockerfile:1

# =============================================================================
# Base image: node:20-slim (Debian-based, better OpenSSL support for Prisma)
# =============================================================================
FROM node:20-slim AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

# Install OpenSSL for Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# =============================================================================
# Builder (dev deps + build + prisma generate)
# =============================================================================
FROM base AS builder
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/config/package.json ./packages/config/
COPY packages/types/package.json ./packages/types/
COPY packages/ui/package.json ./packages/ui/
COPY packages/utils/package.json ./packages/utils/

# Install with --ignore-scripts to prevent postinstall from running
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy source code
COPY apps/api/ ./apps/api/
COPY packages/ ./packages/

# Explicitly run prisma generate
RUN pnpm --filter ./apps/api... exec prisma generate

# Build the API
RUN pnpm --filter ./apps/api... build

# =============================================================================
# Final runtime
# =============================================================================
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install curl for health checks and openssl for Prisma
RUN apt-get update && apt-get install -y curl openssl && rm -rf /var/lib/apt/lists/*

# Copy entire node_modules from builder (includes Prisma in pnpm store)
COPY --from=builder /app/node_modules ./node_modules

# Copy dist to /app/dist (where the code expects it)
COPY --from=builder /app/apps/api/dist ./dist

# Copy Prisma schema
COPY --from=builder /app/apps/api/prisma ./prisma

# Copy package.json for module resolution
COPY --from=builder /app/apps/api/package.json ./package.json

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "dist/index.js"]
