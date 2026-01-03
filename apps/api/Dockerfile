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

# Generate Prisma Client for TypeScript compilation
RUN pnpm --filter ./apps/api exec prisma generate

# Build the API
RUN pnpm --filter ./apps/api... build

# Use pnpm deploy to create a self-contained production bundle
RUN pnpm --filter ./apps/api... deploy --prod /app/out

# Generate Prisma Client INSIDE the deployed bundle
# This ensures the generated artifacts are part of the final production node_modules
WORKDIR /app/out
COPY apps/api/prisma ./prisma
RUN pnpm exec prisma generate

# =============================================================================
# Runner
# =============================================================================
FROM node:20-slim AS runner
WORKDIR /app/apps/api
ENV NODE_ENV=production

# Install runtime dependencies
RUN apt-get update && apt-get install -y openssl curl && rm -rf /var/lib/apt/lists/*

# Copy the deployed bundle (now including generated Prisma Client)
COPY --from=builder /app/out /app/apps/api

# Copy the built dist directory
COPY --from=builder /app/apps/api/dist /app/apps/api/dist

# Copy Prisma schema for runtime reference
COPY --from=builder /app/apps/api/prisma /app/apps/api/prisma

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "dist/index.js"]
