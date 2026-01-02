# =============================================================================
# Nasneh API - Multi-stage Dockerfile
# =============================================================================
# Stage 1: Build (full dependencies + build)
# Stage 2: Production (minimal runtime)
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Build
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

WORKDIR /app

# Copy workspace configuration files first (for better caching)
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./

# Copy all package.json files for workspace packages
COPY apps/api/package.json ./apps/api/
COPY packages/config/package.json ./packages/config/
COPY packages/types/package.json ./packages/types/
COPY packages/ui/package.json ./packages/ui/
COPY packages/utils/package.json ./packages/utils/

# Copy Prisma schema BEFORE install (needed for postinstall: prisma generate)
COPY apps/api/prisma ./apps/api/prisma

# Install ALL dependencies (including devDependencies for build)
# Note: postinstall runs prisma generate which needs the schema
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/api/ ./apps/api/
COPY packages/ ./packages/

# Generate Prisma client (ensure it's generated)
RUN cd apps/api && pnpm db:generate

# Build the API
RUN pnpm --filter @nasneh/api build

# -----------------------------------------------------------------------------
# Stage 2: Production Dependencies
# -----------------------------------------------------------------------------
FROM node:20-alpine AS deps

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

WORKDIR /app

# Copy workspace configuration files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# Copy all package.json files for workspace packages
COPY apps/api/package.json ./apps/api/
COPY packages/config/package.json ./packages/config/
COPY packages/types/package.json ./packages/types/
COPY packages/ui/package.json ./packages/ui/
COPY packages/utils/package.json ./packages/utils/

# Copy Prisma schema (needed for prisma generate in postinstall)
COPY apps/api/prisma ./apps/api/prisma

# Install production dependencies only
# This creates a clean node_modules with only prod deps
RUN pnpm install --frozen-lockfile --prod

# Generate Prisma client for production
RUN cd apps/api && npx prisma generate

# -----------------------------------------------------------------------------
# Stage 3: Production Runtime
# -----------------------------------------------------------------------------
FROM node:20-alpine AS production

# Install curl for health checks (ECS task definition uses curl)
RUN apk add --no-cache curl

# Add non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy production node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy built API files from builder stage
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/

# Copy Prisma schema (needed for migrations)
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma

# Copy workspace packages if needed at runtime
COPY --from=builder /app/packages ./packages

# Set ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Set working directory to api
WORKDIR /app/apps/api

# Environment variables (defaults, override at runtime)
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "dist/index.js"]
