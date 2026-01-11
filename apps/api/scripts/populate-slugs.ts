#!/usr/bin/env tsx
/**
 * Populate Slugs for Existing Products and Services
 * 
 * This script generates slugs for all products and services that don't have one yet.
 * Safe to run multiple times (idempotent).
 * 
 * Usage:
 *   APP_ENVIRONMENT=staging tsx scripts/populate-slugs.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Generate URL-safe slug from name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/-+/g, '-')       // Remove duplicate hyphens
    .substring(0, 100);        // Max 100 chars
}

/**
 * Ensure slug is unique by appending counter if needed
 */
async function ensureUniqueSlug(
  baseSlug: string,
  entityType: 'product' | 'service',
  excludeId?: string
): Promise<string> {
  let slug = baseSlug;
  let counter = 1;
  
  while (true) {
    // Check if slug exists
    const existing = entityType === 'product'
      ? await prisma.product.findFirst({
          where: {
            slug,
            ...(excludeId && { id: { not: excludeId } }),
          },
        })
      : await prisma.service.findFirst({
          where: {
            slug,
            ...(excludeId && { id: { not: excludeId } }),
          },
        });
    
    if (!existing) {
      return slug;
    }
    
    // Append counter and try again
    counter++;
    slug = `${baseSlug}-${counter}`;
  }
}

async function populateProductSlugs() {
  console.log('📦 Populating product slugs...');
  
  // Get all products without slugs (empty string)
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { slug: '' },
        { slug: null as any }, // In case some are null
      ],
    },
  });
  
  console.log(`   Found ${products.length} products without slugs`);
  
  let updated = 0;
  for (const product of products) {
    const baseSlug = generateSlug(product.name);
    const uniqueSlug = await ensureUniqueSlug(baseSlug, 'product', product.id);
    
    await prisma.product.update({
      where: { id: product.id },
      data: { slug: uniqueSlug },
    });
    
    console.log(`   ✓ ${product.name} → ${uniqueSlug}`);
    updated++;
  }
  
  console.log(`✅ Updated ${updated} product slugs\n`);
}

async function populateServiceSlugs() {
  console.log('🔧 Populating service slugs...');
  
  // Get all services without slugs (empty string)
  const services = await prisma.service.findMany({
    where: {
      OR: [
        { slug: '' },
        { slug: null as any }, // In case some are null
      ],
    },
  });
  
  console.log(`   Found ${services.length} services without slugs`);
  
  let updated = 0;
  for (const service of services) {
    const baseSlug = generateSlug(service.name);
    const uniqueSlug = await ensureUniqueSlug(baseSlug, 'service', service.id);
    
    await prisma.service.update({
      where: { id: service.id },
      data: { slug: uniqueSlug },
    });
    
    console.log(`   ✓ ${service.name} → ${uniqueSlug}`);
    updated++;
  }
  
  console.log(`✅ Updated ${updated} service slugs\n`);
}

async function main() {
  console.log('🚀 Starting slug population...\n');
  
  try {
    await populateProductSlugs();
    await populateServiceSlugs();
    
    console.log('✅ All slugs populated successfully!');
  } catch (error) {
    console.error('❌ Error populating slugs:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
