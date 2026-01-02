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
# 1) Production deps (no scripts)
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

# Install with --ignore-scripts to prevent postinstall from running
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy source code
COPY apps/api/ ./apps/api/
COPY packages/ ./packages/

# Explicitly run prisma generate
RUN pnpm --filter ./apps/api... exec prisma generate

# Debug: Show where Prisma client was generated
RUN echo "=== DEBUG: Prisma paths after generate ===" && \
    ls -la apps/api/node_modules/.prisma 2>/dev/null || echo "apps/api/node_modules/.prisma NOT FOUND" && \
    ls -la apps/api/node_modules/@prisma/client 2>/dev/null || echo "apps/api/node_modules/@prisma/client NOT FOUND" && \
    ls -la node_modules/.prisma 2>/dev/null || echo "node_modules/.prisma NOT FOUND" && \
    ls -la node_modules/@prisma/client 2>/dev/null || echo "node_modules/@prisma/client NOT FOUND" && \
    find /app -name ".prisma" -type d 2>/dev/null | head -5 || echo "No .prisma dirs found" && \
    find /app -path "*/@prisma/client" -type d 2>/dev/null | head -5 || echo "No @prisma/client dirs found"

# Build the API
RUN pnpm --filter ./apps/api... build

# =============================================================================
# 3) Final runtime
# =============================================================================
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install curl for health checks and openssl for Prisma
RUN apt-get update && apt-get install -y curl openssl && rm -rf /var/lib/apt/lists/*

# Copy node_modules from deps (has express and all prod deps)
COPY --from=deps /app/node_modules ./node_modules

# Copy dist to /app/dist (where the code expects it)
COPY --from=builder /app/apps/api/dist ./dist

# Copy Prisma schema
COPY --from=builder /app/apps/api/prisma ./prisma

# Copy Prisma generated client - try multiple possible locations
# pnpm may put it in root node_modules or apps/api/node_modules
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy package.json for module resolution
COPY --from=builder /app/apps/api/package.json ./package.json

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "dist/index.js"]
