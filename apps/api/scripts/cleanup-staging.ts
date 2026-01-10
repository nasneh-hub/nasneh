#!/usr/bin/env tsx
/**
 * Staging E2E Test Data Cleanup
 * 
 * Removes all __E2E__* test data from staging database.
 * 
 * Deletes:
 * - All __E2E__ services
 * - All __E2E__ service providers
 * - All __E2E__ test users
 * - Related availability rules (cascade)
 * - Related bookings (cascade)
 * 
 * Usage:
 *   tsx scripts/cleanup-staging.ts
 *   OR
 *   pnpm cleanup:staging
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Staging-only guard
function ensureStagingEnvironment() {
  const appEnv = process.env.APP_ENVIRONMENT || '';
  const nodeEnv = process.env.NODE_ENV || '';
  const dbUrl = process.env.DATABASE_URL || '';
  
  // Primary check: APP_ENVIRONMENT must be 'staging'
  if (appEnv !== 'staging') {
    console.error('❌ ERROR: This script requires APP_ENVIRONMENT=staging');
    console.error('   Current APP_ENVIRONMENT:', appEnv || '(not set)');
    console.error('');
    console.error('   This script can only run on staging environment.');
    console.error('   Set APP_ENVIRONMENT=staging to proceed.');
    process.exit(1);
  }
  
  // Secondary check: Refuse to run on production
  const isProduction = dbUrl.includes('production') || 
                       dbUrl.includes('nasneh-prod') ||
                       nodeEnv === 'production' ||
                       appEnv === 'production';
  
  if (isProduction) {
    console.error('❌ ERROR: This script cannot run on PRODUCTION!');
    console.error('   Production indicators detected.');
    process.exit(1);
  }
  
  console.log('✅ Environment check passed: APP_ENVIRONMENT=staging');
  console.log('');
  return Promise.resolve();
}

async function main() {
  // Ensure we're running on staging
  await ensureStagingEnvironment();
  console.log('🧹 Starting staging E2E data cleanup...\n');

  let deletedCount = 0;

  // 1. Delete services starting with __E2E__
  console.log('1️⃣  Deleting __E2E__ services...');
  const deletedServices = await prisma.service.deleteMany({
    where: {
      name: {
        startsWith: '__E2E__',
      },
    },
  });
  deletedCount += deletedServices.count;
  console.log(`   ✅ Deleted ${deletedServices.count} services\n`);

  // 2. Delete service providers with __E2E__ in business name
  console.log('2️⃣  Deleting __E2E__ service providers...');
  const deletedProviders = await prisma.serviceProvider.deleteMany({
    where: {
      businessName: {
        startsWith: '__E2E__',
      },
    },
  });
  deletedCount += deletedProviders.count;
  console.log(`   ✅ Deleted ${deletedProviders.count} providers\n`);

  // 3. Delete users with __E2E__ in name
  console.log('3️⃣  Deleting __E2E__ users...');
  const deletedUsers = await prisma.user.deleteMany({
    where: {
      name: {
        startsWith: '__E2E__',
      },
    },
  });
  deletedCount += deletedUsers.count;
  console.log(`   ✅ Deleted ${deletedUsers.count} users\n`);

  // 4. Summary
  console.log('📊 Cleanup Summary:');
  console.log(`   🗑️  Total deleted: ${deletedCount} records`);
  console.log();

  if (deletedCount === 0) {
    console.log('ℹ️  No __E2E__ test data found to clean up.');
  } else {
    console.log('✅ Staging E2E data cleanup complete!');
  }
}

main()
  .catch((error) => {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
