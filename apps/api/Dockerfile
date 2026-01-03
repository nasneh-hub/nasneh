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
# pnpm stores generated client in .pnpm store, accessible via symlinks
RUN pnpm --filter ./apps/api exec prisma generate

# Build TypeScript (now has access to generated Prisma types)
RUN pnpm --filter ./apps/api... build

# Create production bundle with pnpm deploy
# This creates /app/out with production dependencies
# pnpm deploy automatically resolves and copies @prisma/client with generated code
RUN pnpm --filter ./apps/api... deploy --prod /app/out

# Copy the built dist directory to the production bundle
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
# This includes: node_modules (with @prisma/client + generated code), dist, prisma, package.json
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
