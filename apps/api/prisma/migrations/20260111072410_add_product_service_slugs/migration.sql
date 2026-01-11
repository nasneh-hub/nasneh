-- Add slug column to products table
ALTER TABLE "products" ADD COLUMN "slug" TEXT NOT NULL DEFAULT '';

-- Add unique constraint and index
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");
CREATE INDEX "products_slug_idx" ON "products"("slug");

-- Add slug column to services table
ALTER TABLE "services" ADD COLUMN "slug" TEXT NOT NULL DEFAULT '';

-- Add unique constraint and index
CREATE UNIQUE INDEX "services_slug_key" ON "services"("slug");
CREATE INDEX "services_slug_idx" ON "services"("slug");

-- Note: Slugs will be populated by seed script or migration script
