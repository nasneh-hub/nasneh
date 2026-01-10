#!/usr/bin/env tsx
/**
 * Staging E2E Test Data Seeder
 * 
 * Creates test data for S5-03 E2E booking flow verification.
 * Idempotent: can be run multiple times without duplicating data.
 * 
 * Creates:
 * - 1 __E2E__ test user (provider)
 * - 1 __E2E__ service provider
 * - 5 __E2E__ services (mix of categories)
 * - Availability rules (Mon-Fri 9am-5pm)
 * - Slots for next 7 days
 * 
 * Usage:
 *   tsx scripts/seed-staging.ts
 *   OR
 *   pnpm seed:staging
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Staging-only guard
function ensureStagingEnvironment() {
  const dbUrl = process.env.DATABASE_URL || '';
  const nodeEnv = process.env.NODE_ENV || '';
  
  // Check for staging indicators
  const isStaging = dbUrl.includes('staging') || 
                    dbUrl.includes('nasneh-staging') ||
                    nodeEnv === 'staging';
  
  // Refuse to run on production
  const isProduction = dbUrl.includes('production') || 
                       dbUrl.includes('nasneh-prod') ||
                       nodeEnv === 'production';
  
  if (isProduction) {
    console.error('❌ ERROR: This script cannot run on PRODUCTION!');
    console.error('   DATABASE_URL contains production indicators.');
    process.exit(1);
  }
  
  if (!isStaging) {
    console.warn('⚠️  WARNING: Could not confirm staging environment.');
    console.warn('   DATABASE_URL:', dbUrl.substring(0, 30) + '...');
    console.warn('   NODE_ENV:', nodeEnv || '(not set)');
    console.warn('');
    console.warn('   This script should only run on staging.');
    console.warn('   Press Ctrl+C to cancel, or wait 5 seconds to continue...');
    console.warn('');
    
    // Give user 5 seconds to cancel
    return new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  console.log('✅ Environment check passed: STAGING');
  console.log('');
  return Promise.resolve();
}

// Test data constants
const E2E_PHONE = '+97333000001';
const E2E_USER_NAME = '__E2E__ Test Provider';
const E2E_PROVIDER_NAME = '__E2E__ Test Services';

const SERVICES = [
  {
    name: '__E2E__ Home Cleaning Service',
    nameAr: 'خدمة تنظيف المنزل للاختبار',
    description: 'Professional home cleaning service for E2E testing',
    descriptionAr: 'خدمة تنظيف منزلية احترافية للاختبار الشامل',
    price: '25.000',
    serviceType: 'APPOINTMENT' as const,
    durationMinutes: 120,
    category: 'HOME' as const,
  },
  {
    name: '__E2E__ Plumbing Repair',
    nameAr: 'إصلاح السباكة للاختبار',
    description: 'Quick plumbing repairs for E2E testing',
    descriptionAr: 'إصلاحات سباكة سريعة للاختبار الشامل',
    price: '35.000',
    serviceType: 'APPOINTMENT' as const,
    durationMinutes: 90,
    category: 'HOME' as const,
  },
  {
    name: '__E2E__ Personal Training',
    nameAr: 'تدريب شخصي للاختبار',
    description: 'One-on-one fitness training for E2E testing',
    descriptionAr: 'تدريب لياقة بدنية فردي للاختبار الشامل',
    price: '40.000',
    serviceType: 'APPOINTMENT' as const,
    durationMinutes: 60,
    category: 'PERSONAL' as const,
  },
  {
    name: '__E2E__ Business Consulting',
    nameAr: 'استشارات أعمال للاختبار',
    description: 'Professional business consulting for E2E testing',
    descriptionAr: 'استشارات أعمال احترافية للاختبار الشامل',
    price: '50.000',
    serviceType: 'APPOINTMENT' as const,
    durationMinutes: 90,
    category: 'PROFESSIONAL' as const,
  },
  {
    name: '__E2E__ Electrical Work',
    nameAr: 'أعمال كهربائية للاختبار',
    description: 'Electrical installation and repairs for E2E testing',
    descriptionAr: 'تركيب وإصلاح كهربائي للاختبار الشامل',
    price: '30.000',
    serviceType: 'APPOINTMENT' as const,
    durationMinutes: 120,
    category: 'HOME' as const,
  },
];

async function main() {
  // Ensure we're running on staging
  await ensureStagingEnvironment();
  
  console.log('🌱 Starting staging E2E data seeding...\n');

  let createdCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  // 1. Create or get test user
  console.log('1️⃣  Creating/updating test user...');
  const user = await prisma.user.upsert({
    where: { phone: E2E_PHONE },
    update: {
      name: E2E_USER_NAME,
      role: 'PROVIDER',
      status: 'VERIFIED',
    },
    create: {
      phone: E2E_PHONE,
      name: E2E_USER_NAME,
      role: 'PROVIDER',
      status: 'VERIFIED',
    },
  });
  console.log(`   ✅ User: ${user.name} (${user.phone})\n`);

  // 2. Create or get service provider
  console.log('2️⃣  Creating/updating service provider...');
  const provider = await prisma.serviceProvider.upsert({
    where: { userId: user.id },
    update: {
      businessName: E2E_PROVIDER_NAME,
      description: 'E2E test service provider for booking flow verification',
      category: 'HOME',
      status: 'ACTIVE',
      subscriptionPlan: 'PROFESSIONAL',
    },
    create: {
      userId: user.id,
      businessName: E2E_PROVIDER_NAME,
      description: 'E2E test service provider for booking flow verification',
      category: 'HOME',
      status: 'ACTIVE',
      subscriptionPlan: 'PROFESSIONAL',
    },
  });
  console.log(`   ✅ Provider: ${provider.businessName}\n`);

  // 3. Create availability rules (Mon-Fri 9am-5pm)
  console.log('3️⃣  Creating availability rules...');
  const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'] as const;
  
  for (const day of daysOfWeek) {
    const existing = await prisma.availabilityRule.findFirst({
      where: {
        providerId: provider.id,
        dayOfWeek: day,
      },
    });

    if (!existing) {
      await prisma.availabilityRule.create({
        data: {
          providerId: provider.id,
          dayOfWeek: day,
          startTime: new Date('1970-01-01T09:00:00Z'),
          endTime: new Date('1970-01-01T17:00:00Z'),
          isActive: true,
        },
      });
      createdCount++;
      console.log(`   ✅ Created rule for ${day}`);
    } else {
      skippedCount++;
      console.log(`   ⏭️  Skipped ${day} (already exists)`);
    }
  }
  console.log();

  // 4. Create services
  console.log('4️⃣  Creating services...');
  const createdServices = [];

  for (const serviceData of SERVICES) {
    // Use name as unique identifier for upsert
    const existing = await prisma.service.findFirst({
      where: {
        providerId: provider.id,
        name: serviceData.name,
      },
    });

    if (existing) {
      const updated = await prisma.service.update({
        where: { id: existing.id },
        data: {
          nameAr: serviceData.nameAr,
          description: serviceData.description,
          descriptionAr: serviceData.descriptionAr,
          price: serviceData.price,
          serviceType: serviceData.serviceType,
          durationMinutes: serviceData.durationMinutes,
          isAvailable: true,
          status: 'ACTIVE',
        },
      });
      updatedCount++;
      createdServices.push(updated);
      console.log(`   🔄 Updated: ${updated.name}`);
    } else {
      const created = await prisma.service.create({
        data: {
          providerId: provider.id,
          name: serviceData.name,
          nameAr: serviceData.nameAr,
          description: serviceData.description,
          descriptionAr: serviceData.descriptionAr,
          price: serviceData.price,
          serviceType: serviceData.serviceType,
          durationMinutes: serviceData.durationMinutes,
          isAvailable: true,
          status: 'ACTIVE',
        },
      });
      createdCount++;
      createdServices.push(created);
      console.log(`   ✅ Created: ${created.name}`);
    }
  }
  console.log();

  // 5. Summary
  console.log('📊 Seeding Summary:');
  console.log(`   ✅ Created: ${createdCount} records`);
  console.log(`   🔄 Updated: ${updatedCount} records`);
  console.log(`   ⏭️  Skipped: ${skippedCount} records (already exist)`);
  console.log();

  console.log('🎯 E2E Test Data Ready:');
  console.log(`   👤 User: ${user.phone}`);
  console.log(`   🏢 Provider: ${provider.businessName}`);
  console.log(`   📋 Services: ${createdServices.length}`);
  console.log(`   📅 Availability: Mon-Fri 9am-5pm`);
  console.log();

  console.log('📝 Service IDs for testing:');
  createdServices.forEach((service, index) => {
    console.log(`   ${index + 1}. ${service.name}`);
    console.log(`      ID: ${service.id}`);
    console.log(`      URL: https://staging.nasneh.com/services/${service.id}`);
  });
  console.log();

  console.log('✅ Staging E2E data seeding complete!');
}

main()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
