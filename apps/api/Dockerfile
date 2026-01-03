# syntax=docker/dockerfile:1

# =============================================================================
# Base image: node:20-slim
# =============================================================================
FROM node:20-slim AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate
RUN apt-get update && apt-get install -y openssl curl && rm -rf /var/lib/apt/lists/*

# =============================================================================
# Builder Stage
# =============================================================================
FROM base AS builder

# Copy package.json files for dependency installation
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/config/package.json ./packages/config/
COPY packages/types/package.json ./packages/types/
COPY packages/ui/package.json ./packages/ui/
COPY packages/utils/package.json ./packages/utils/

# Install ALL dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy source code
COPY apps/api/ ./apps/api/
COPY packages/ ./packages/

# Generate Prisma Client (BEFORE build)
# This generates client in /app/node_modules/.pnpm/@prisma+client@VERSION/node_modules/.prisma/client/
RUN pnpm --filter ./apps/api exec prisma generate

# Build TypeScript (now has access to generated Prisma types)
RUN pnpm --filter ./apps/api... build

# Create production bundle with pnpm deploy
# This creates /app/out with production dependencies
RUN pnpm --filter ./apps/api... deploy --prod /app/out

# CRITICAL FIX: Manually copy the generated Prisma client
# pnpm deploy copies @prisma/client package but NOT the generated .prisma subdirectory
# We need to copy the entire generated client from the pnpm store
RUN cp -r /app/node_modules/.pnpm/@prisma+client@*/node_modules/.prisma /app/out/node_modules/@prisma/ || \
    (echo "ERROR: Failed to copy generated Prisma client" && exit 1)

# Copy the built dist directory
RUN cp -r /app/apps/api/dist /app/out/

# Copy the Prisma schema for runtime reference
RUN cp -r /app/apps/api/prisma /app/out/

# =============================================================================
# Runner Stage (Production)
# =============================================================================
FROM node:20-slim AS runner

# Set working directory
WORKDIR /app

# Install runtime dependencies (openssl for Prisma, curl for healthcheck)
RUN apt-get update && apt-get install -y openssl curl && rm -rf /var/lib/apt/lists/*

# Copy the complete production bundle from builder
# This includes: node_modules (with @prisma/client + .prisma/client), dist, prisma, package.json
COPY --from=builder /app/out /app

# Set environment
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "dist/index.js"]
