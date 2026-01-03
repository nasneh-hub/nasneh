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
RUN pnpm --filter ./apps/api exec prisma generate

# Build TypeScript
RUN pnpm --filter ./apps/api... build

# Create production bundle with pnpm deploy
RUN pnpm --filter ./apps/api... deploy --prod /app/out

# CRITICAL FIX: Replace symlinked @prisma/client with actual files
# AND ensure .prisma directory is in the correct location
# 
# Prisma's require structure:
# @prisma/client/default.js requires '.prisma/client/default'
# This means .prisma must be INSIDE @prisma/client/, not beside it
#
# Steps:
# 1. Remove the symlink
# 2. Copy actual @prisma/client package files
# 3. Copy .prisma directory INSIDE @prisma/client/
RUN rm -rf /app/out/node_modules/@prisma/client && \
    cp -rL /app/node_modules/.pnpm/@prisma+client@*/node_modules/@prisma/client /app/out/node_modules/@prisma/ && \
    cp -r /app/node_modules/.pnpm/@prisma+client@*/node_modules/.prisma /app/out/node_modules/@prisma/client/

# Copy the built dist directory
RUN cp -r /app/apps/api/dist /app/out/

# Copy the Prisma schema
RUN cp -r /app/apps/api/prisma /app/out/

# =============================================================================
# Runner Stage (Production)
# =============================================================================
FROM node:20-slim AS runner

# Set working directory
WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y openssl curl && rm -rf /var/lib/apt/lists/*

# Copy the complete production bundle from builder
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
