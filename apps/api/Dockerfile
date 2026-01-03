# syntax=docker/dockerfile:1

# =============================================================================
# Base image: node:20-slim
# =============================================================================
FROM node:20-slim AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate
RUN apt-get update && apt-get install -y openssl curl && rm -rf /var/lib/apt/lists/*

# =============================================================================
# Builder
# =============================================================================
FROM base AS builder
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/config/package.json ./packages/config/
COPY packages/types/package.json ./packages/types/
COPY packages/ui/package.json ./packages/ui/
COPY packages/utils/package.json ./packages/utils/

# Install all dependencies
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy source code
COPY apps/api/ ./apps/api/
COPY packages/ ./packages/

# Generate Prisma Client
RUN pnpm --filter ./apps/api... exec prisma generate

# Build the API
RUN pnpm --filter ./apps/api... build

# Use pnpm deploy to create a self-contained production bundle
# This isolates the app and its dependencies into a single directory without symlinks
RUN pnpm --filter ./apps/api... deploy --prod /app/out

# =============================================================================
# Runner
# =============================================================================
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install runtime dependencies
RUN apt-get update && apt-get install -y openssl curl && rm -rf /var/lib/apt/lists/*

# Copy the deployed bundle from builder
# This includes node_modules (dereferenced), package.json, and other necessary files
COPY --from=builder /app/out /app

# Copy the built dist directory (pnpm deploy --prod doesn't include build artifacts by default)
COPY --from=builder /app/apps/api/dist /app/dist

# Copy Prisma schema for runtime
COPY --from=builder /app/apps/api/prisma /app/prisma

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "dist/index.js"]
