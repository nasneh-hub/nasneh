# =============================================================================
# Nasneh API - Multi-stage Dockerfile
# =============================================================================
# Stage 1: builder    - Full install, prisma generate, build
# Stage 2: production - Runtime with full node_modules (no prune)
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Builder
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

WORKDIR /app

# Copy workspace configuration
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./

# Copy all package.json files
COPY apps/api/package.json ./apps/api/
COPY packages/config/package.json ./packages/config/
COPY packages/types/package.json ./packages/types/
COPY packages/ui/package.json ./packages/ui/
COPY packages/utils/package.json ./packages/utils/

# Copy Prisma schema (needed for prisma generate)
COPY apps/api/prisma ./apps/api/prisma

# Install ALL dependencies (including devDependencies)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/api/ ./apps/api/
COPY packages/ ./packages/

# Generate Prisma client
RUN pnpm --filter @nasneh/api exec prisma generate

# Build the API
RUN pnpm --filter @nasneh/api build

# Debug: Show what was built
RUN echo "=== Builder: apps/api/dist contents ===" && \
    ls -la /app/apps/api/dist/ && \
    echo "=== Builder: apps/api/dist/config ===" && \
    ls -la /app/apps/api/dist/config/ && \
    echo "=== Builder: node_modules sample ===" && \
    ls /app/node_modules | head -10

# NOTE: We do NOT run pnpm prune --prod because it breaks pnpm symlinks
# This results in a larger image but guarantees all dependencies work

# -----------------------------------------------------------------------------
# Stage 2: Production Runtime
# -----------------------------------------------------------------------------
FROM node:20-alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

# Add non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy the entire node_modules (pnpm structure with symlinks)
COPY --from=builder /app/node_modules ./node_modules

# Copy the dist folder to /app/dist
COPY --from=builder /app/apps/api/dist ./dist

# Copy package.json for Node.js module resolution
COPY --from=builder /app/apps/api/package.json ./package.json

# Copy Prisma schema and generated client
COPY --from=builder /app/apps/api/prisma ./prisma

# Copy pnpm workspace config (needed for module resolution)
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Debug: Show final structure
RUN echo "=== Production: /app contents ===" && \
    ls -la /app/ && \
    echo "=== Production: /app/dist contents ===" && \
    ls -la /app/dist/ && \
    echo "=== Production: /app/dist/config ===" && \
    ls -la /app/dist/config/ && \
    echo "=== Production: node_modules sample ===" && \
    ls /app/node_modules | head -10 && \
    echo "=== Production: Check express exists ===" && \
    ls -la /app/node_modules/express 2>/dev/null || echo "express not in root node_modules" && \
    ls -la /app/node_modules/.pnpm/express* 2>/dev/null | head -5 || echo "checking .pnpm store"

# Set ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Health check using curl
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Run from /app, executing dist/index.js
CMD ["node", "dist/index.js"]
