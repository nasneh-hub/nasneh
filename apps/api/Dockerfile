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

# Generate Prisma Client (BEFORE build, in full node_modules)
# This creates /app/node_modules/@prisma/client/ with generated code
RUN pnpm --filter ./apps/api exec prisma generate

# DEBUG: Show where Prisma client was actually generated
RUN echo "=== Checking /app/node_modules/ for Prisma ===" && \
    ls -la /app/node_modules/ | grep -i prisma || echo "No prisma in /app/node_modules/"
RUN echo "=== Checking /app/node_modules/@prisma/ ===" && \
    ls -la /app/node_modules/@prisma/ || echo "No @prisma directory"
RUN echo "=== Checking /app/node_modules/.prisma/ ===" && \
    ls -la /app/node_modules/.prisma/ || echo "No .prisma directory"
RUN echo "=== Checking /app/node_modules/.pnpm/ for prisma ===" && \
    find /app/node_modules/.pnpm -name "*prisma*" -type d | head -n 20 || echo "No prisma in .pnpm"

# Build TypeScript (now has access to generated Prisma types)
# This creates /app/apps/api/dist/
RUN pnpm --filter ./apps/api... build

# Create production bundle with pnpm deploy
# This creates /app/out with ONLY production dependencies
RUN pnpm --filter ./apps/api... deploy --prod /app/out

# DEBUG: Show what's in /app/out/node_modules/ after deploy
RUN echo "=== Checking /app/out/node_modules/ after deploy ===" && \
    ls -la /app/out/node_modules/ | grep -i prisma || echo "No prisma in /app/out/node_modules/"

# Manually copy the generated Prisma Client to the production bundle
# pnpm deploy doesn't copy generated artifacts, so we do it manually
# TEMPORARILY DISABLED FOR DEBUGGING - will fix after seeing debug output
# RUN cp -r /app/node_modules/@prisma /app/out/node_modules/

# Copy the built dist directory to the production bundle
RUN cp -r /app/apps/api/dist /app/out/

# Copy the Prisma schema for runtime reference (migrations, introspection)
RUN cp -r /app/apps/api/prisma /app/out/

# =============================================================================
# Runner Stage (Production)
# =============================================================================
FROM node:20-slim AS runner

# Set working directory to match the application structure
WORKDIR /app

# Install runtime dependencies (openssl for Prisma, curl for healthcheck)
RUN apt-get update && apt-get install -y openssl curl && rm -rf /var/lib/apt/lists/*

# Copy the complete production bundle from builder
# This includes: node_modules (with @prisma), dist, prisma, package.json
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
