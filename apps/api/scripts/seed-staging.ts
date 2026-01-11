#!/usr/bin/env tsx
/**
 * Staging Data Seeder - S6-03 Data Foundation
 * 
 * Creates comprehensive test data for all customer flows:
 * - Categories (10+)
 * - Test Users (5+)
 * - Vendors (3+)
 * - Products (50+)
 * - Service Providers (3+)
 * - Services (20+)
 * 
 * Idempotent: can be run multiple times without duplicating data.
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
  const appEnv = process.env.APP_ENVIRONMENT || '';
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
  
  // Secondary safety check: Even if APP_ENVIRONMENT=staging, block if DATABASE_URL looks like production
  const dbUrlLower = dbUrl.toLowerCase();
  const productionIndicators = [
    'prod',
    'production',
    'nasneh-prod',
    'nasneh-production'
  ];
  
  const hasProductionIndicator = productionIndicators.some(indicator => 
    dbUrlLower.includes(indicator)
  );
  
  if (hasProductionIndicator) {
    console.error('❌ ERROR: DATABASE_URL contains production indicators!');
    console.error('   APP_ENVIRONMENT is staging, but DATABASE_URL looks like production.');
    console.error('   Database host:', dbUrl.split('@')[1]?.split('/')[0] || '(hidden)');
    console.error('');
    console.error('   This is a safety check to prevent accidental production data modification.');
    console.error('   If this is truly staging, update the DATABASE_URL to not contain production keywords.');
    process.exit(1);
  }
  
  console.log('✅ Environment check passed: APP_ENVIRONMENT=staging');
  console.log('✅ Database check passed: No production indicators in DATABASE_URL');
  console.log('');
  return Promise.resolve();
}

// ===========================================
// Helper Functions
// ===========================================

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

// ===========================================
// Test Data Constants
// ===========================================

// Permanent Test Accounts (NEVER DELETE)
// These accounts are used for automated testing and manual QA
// OTP: 123456 (staging-only, via TEST_OTP env var)
const PERMANENT_TEST_ACCOUNTS = [
  { phone: '+97336000000', role: 'CUSTOMER' as const, name: 'Test Customer', email: 'customer@test.nasneh.com' },
  { phone: '+97336000001', role: 'VENDOR' as const, name: 'Test Vendor', email: 'vendor@test.nasneh.com' },
  { phone: '+97336000002', role: 'ADMIN' as const, name: 'Test Admin', email: 'admin@test.nasneh.com' },
];

// Additional Test Users (can be deleted/recreated)
const TEST_USERS = [
  { phone: '+97333111001', role: 'CUSTOMER' as const, name: 'Test Customer' },
  { phone: '+97333111002', role: 'VENDOR' as const, name: 'Test Vendor' },
  { phone: '+97333111003', role: 'PROVIDER' as const, name: 'Test Provider' },
  { phone: '+97333111004', role: 'ADMIN' as const, name: 'Test Admin' },
  { phone: '+97333111005', role: 'DRIVER' as const, name: 'Test Driver' },
];

// Categories
const CATEGORIES = [
  { name: 'Home Kitchen', nameAr: 'مطبخ منزلي', slug: 'home-kitchen' },
  { name: 'Crafts', nameAr: 'حرف يدوية', slug: 'crafts' },
  { name: 'Market', nameAr: 'سوق', slug: 'market' },
  { name: 'Food Trucks', nameAr: 'عربات الطعام', slug: 'food-trucks' },
  { name: 'Home Services', nameAr: 'خدمات منزلية', slug: 'home-services' },
  { name: 'Personal Services', nameAr: 'خدمات شخصية', slug: 'personal-services' },
  { name: 'Professional Services', nameAr: 'خدمات مهنية', slug: 'professional-services' },
  { name: 'Bakery', nameAr: 'مخبز', slug: 'bakery' },
  { name: 'Desserts', nameAr: 'حلويات', slug: 'desserts' },
  { name: 'Beverages', nameAr: 'مشروبات', slug: 'beverages' },
];

// Vendors
const VENDORS = [
  {
    storeName: 'Mama\'s Kitchen',
    category: 'HOME_KITCHEN' as const,
    description: 'Authentic home-cooked meals made with love',
    phone: '+97333111002',
  },
  {
    storeName: 'Artisan Crafts',
    category: 'CRAFTS' as const,
    description: 'Handmade crafts and unique gifts',
    phone: '+97333222001',
  },
  {
    storeName: 'Street Food Express',
    category: 'FOOD_TRUCK' as const,
    description: 'Fresh street food on wheels',
    phone: '+97333222002',
  },
];

// Products (50+ total)
const PRODUCTS = {
  homeKitchen: [
    { name: 'Chicken Biryani', nameAr: 'برياني دجاج', price: '3.500', description: 'Aromatic rice with tender chicken' },
    { name: 'Lamb Kabsa', nameAr: 'كبسة لحم', price: '4.000', description: 'Traditional spiced rice with lamb' },
    { name: 'Vegetable Curry', nameAr: 'كاري خضار', price: '2.500', description: 'Mixed vegetables in curry sauce' },
    { name: 'Chicken Shawarma', nameAr: 'شاورما دجاج', price: '1.500', description: 'Grilled chicken wrap' },
    { name: 'Falafel Plate', nameAr: 'صحن فلافل', price: '2.000', description: 'Crispy falafel with tahini' },
    { name: 'Hummus Bowl', nameAr: 'صحن حمص', price: '1.500', description: 'Creamy chickpea dip' },
    { name: 'Tabbouleh Salad', nameAr: 'سلطة تبولة', price: '2.000', description: 'Fresh parsley salad' },
    { name: 'Grilled Fish', nameAr: 'سمك مشوي', price: '5.000', description: 'Fresh grilled fish with rice' },
    { name: 'Stuffed Grape Leaves', nameAr: 'ورق عنب', price: '2.500', description: 'Rice-stuffed vine leaves' },
    { name: 'Lentil Soup', nameAr: 'شوربة عدس', price: '1.000', description: 'Warm lentil soup' },
    { name: 'Chicken Machboos', nameAr: 'مجبوس دجاج', price: '3.500', description: 'Bahraini spiced chicken rice' },
    { name: 'Meat Samosas', nameAr: 'سمبوسة لحم', price: '0.500', description: 'Crispy meat pastries (per piece)' },
    { name: 'Mixed Grill Platter', nameAr: 'صحن مشاوي مشكل', price: '6.000', description: 'Assorted grilled meats' },
    { name: 'Chicken Tikka', nameAr: 'تكا دجاج', price: '3.000', description: 'Marinated grilled chicken' },
    { name: 'Rice Pudding', nameAr: 'مهلبية', price: '1.500', description: 'Creamy rice dessert' },
  ],
  crafts: [
    { name: 'Handwoven Basket', nameAr: 'سلة منسوجة يدوياً', price: '15.000', description: 'Traditional palm leaf basket' },
    { name: 'Ceramic Vase', nameAr: 'مزهرية خزفية', price: '12.000', description: 'Hand-painted ceramic vase' },
    { name: 'Embroidered Cushion', nameAr: 'وسادة مطرزة', price: '8.000', description: 'Hand-embroidered throw pillow' },
    { name: 'Wooden Jewelry Box', nameAr: 'صندوق مجوهرات خشبي', price: '20.000', description: 'Carved wooden box' },
    { name: 'Macrame Wall Hanging', nameAr: 'معلقة حائط ماكرامي', price: '18.000', description: 'Handmade macrame art' },
    { name: 'Clay Pottery Set', nameAr: 'طقم فخار', price: '25.000', description: 'Handcrafted pottery dishes' },
    { name: 'Beaded Necklace', nameAr: 'قلادة خرز', price: '10.000', description: 'Handmade beaded jewelry' },
    { name: 'Leather Journal', nameAr: 'دفتر جلد', price: '15.000', description: 'Hand-bound leather notebook' },
    { name: 'Candle Set', nameAr: 'طقم شموع', price: '12.000', description: 'Handmade scented candles' },
    { name: 'Woven Table Runner', nameAr: 'مفرش طاولة منسوج', price: '14.000', description: 'Handwoven table decor' },
    { name: 'Painted Coasters', nameAr: 'قواعد أكواب مرسومة', price: '6.000', description: 'Hand-painted coaster set' },
    { name: 'Knitted Blanket', nameAr: 'بطانية محبوكة', price: '35.000', description: 'Hand-knitted throw blanket' },
    { name: 'Soap Gift Set', nameAr: 'طقم صابون هدية', price: '10.000', description: 'Handmade natural soaps' },
    { name: 'Dreamcatcher', nameAr: 'صائد الأحلام', price: '8.000', description: 'Handmade dreamcatcher' },
    { name: 'Pressed Flower Art', nameAr: 'لوحة زهور مجففة', price: '16.000', description: 'Framed pressed flowers' },
  ],
  market: [
    { name: 'Fresh Dates', nameAr: 'تمر طازج', price: '5.000', description: 'Premium dates (1kg)' },
    { name: 'Honey Jar', nameAr: 'عسل طبيعي', price: '8.000', description: 'Pure natural honey (500g)' },
    { name: 'Olive Oil', nameAr: 'زيت زيتون', price: '10.000', description: 'Extra virgin olive oil (1L)' },
    { name: 'Mixed Nuts', nameAr: 'مكسرات مشكلة', price: '6.000', description: 'Roasted mixed nuts (500g)' },
    { name: 'Spice Mix', nameAr: 'خلطة بهارات', price: '3.000', description: 'Traditional spice blend' },
    { name: 'Dried Fruits', nameAr: 'فواكه مجففة', price: '7.000', description: 'Assorted dried fruits (500g)' },
    { name: 'Rose Water', nameAr: 'ماء ورد', price: '4.000', description: 'Pure rose water (250ml)' },
    { name: 'Saffron', nameAr: 'زعفران', price: '15.000', description: 'Premium saffron threads (5g)' },
    { name: 'Pickles Jar', nameAr: 'مخلل', price: '3.500', description: 'Mixed pickled vegetables' },
    { name: 'Tahini', nameAr: 'طحينة', price: '4.500', description: 'Sesame seed paste (500g)' },
  ],
  foodTruck: [
    { name: 'Burger Combo', nameAr: 'وجبة برجر', price: '4.500', description: 'Burger with fries and drink' },
    { name: 'Hot Dog', nameAr: 'هوت دوج', price: '2.000', description: 'Classic hot dog' },
    { name: 'Loaded Fries', nameAr: 'بطاطس محملة', price: '3.000', description: 'Fries with toppings' },
    { name: 'Chicken Wings', nameAr: 'أجنحة دجاج', price: '3.500', description: 'Spicy chicken wings (6pcs)' },
    { name: 'Tacos (3pcs)', nameAr: 'تاكو', price: '3.000', description: 'Beef or chicken tacos' },
    { name: 'Nachos Supreme', nameAr: 'ناتشوز سوبريم', price: '4.000', description: 'Loaded nachos' },
    { name: 'Quesadilla', nameAr: 'كيساديا', price: '3.500', description: 'Cheese quesadilla' },
    { name: 'Milkshake', nameAr: 'ميلك شيك', price: '2.500', description: 'Thick milkshake' },
    { name: 'Onion Rings', nameAr: 'حلقات بصل', price: '2.000', description: 'Crispy onion rings' },
    { name: 'Ice Cream Sundae', nameAr: 'آيس كريم صنداي', price: '2.500', description: 'Ice cream with toppings' },
  ],
};

// Service Providers
const SERVICE_PROVIDERS = [
  {
    businessName: 'CleanPro Services',
    category: 'HOME' as const,
    description: 'Professional home cleaning and maintenance',
    phone: '+97333111003',
  },
  {
    businessName: 'Beauty & Wellness',
    category: 'PERSONAL' as const,
    description: 'Beauty treatments and personal care',
    phone: '+97333333001',
  },
  {
    businessName: 'Business Consultants',
    category: 'PROFESSIONAL' as const,
    description: 'Professional business consulting services',
    phone: '+97333333002',
  },
];

// Services (20+ total)
const SERVICES = {
  home: [
    { name: 'Deep House Cleaning', nameAr: 'تنظيف عميق للمنزل', price: '35.000', duration: 180, description: 'Complete deep cleaning service' },
    { name: 'Regular Cleaning', nameAr: 'تنظيف عادي', price: '25.000', duration: 120, description: 'Standard cleaning service' },
    { name: 'Carpet Cleaning', nameAr: 'تنظيف سجاد', price: '20.000', duration: 90, description: 'Professional carpet cleaning' },
    { name: 'Window Cleaning', nameAr: 'تنظيف نوافذ', price: '15.000', duration: 60, description: 'Interior and exterior windows' },
    { name: 'Kitchen Deep Clean', nameAr: 'تنظيف عميق للمطبخ', price: '30.000', duration: 120, description: 'Kitchen appliances and surfaces' },
    { name: 'Bathroom Sanitization', nameAr: 'تعقيم حمامات', price: '18.000', duration: 60, description: 'Complete bathroom cleaning' },
    { name: 'AC Maintenance', nameAr: 'صيانة مكيفات', price: '40.000', duration: 90, description: 'AC cleaning and maintenance' },
    { name: 'Plumbing Repair', nameAr: 'إصلاح سباكة', price: '35.000', duration: 90, description: 'Plumbing fixes and repairs' },
  ],
  personal: [
    { name: 'Haircut & Styling', nameAr: 'قص وتصفيف شعر', price: '15.000', duration: 60, description: 'Professional haircut and styling' },
    { name: 'Manicure & Pedicure', nameAr: 'عناية أظافر', price: '20.000', duration: 90, description: 'Complete nail care' },
    { name: 'Facial Treatment', nameAr: 'عناية بشرة', price: '30.000', duration: 60, description: 'Deep facial cleansing' },
    { name: 'Massage Therapy', nameAr: 'علاج تدليك', price: '40.000', duration: 60, description: 'Relaxing massage session' },
    { name: 'Makeup Service', nameAr: 'خدمة مكياج', price: '35.000', duration: 90, description: 'Professional makeup application' },
    { name: 'Personal Training', nameAr: 'تدريب شخصي', price: '40.000', duration: 60, description: 'One-on-one fitness training' },
  ],
  professional: [
    { name: 'Business Strategy', nameAr: 'استراتيجية أعمال', price: '100.000', duration: 120, description: 'Business planning consultation' },
    { name: 'Marketing Consultation', nameAr: 'استشارة تسويق', price: '80.000', duration: 90, description: 'Marketing strategy session' },
    { name: 'Financial Planning', nameAr: 'تخطيط مالي', price: '90.000', duration: 90, description: 'Financial advisory service' },
    { name: 'Legal Consultation', nameAr: 'استشارة قانونية', price: '120.000', duration: 60, description: 'Legal advice session' },
    { name: 'HR Consulting', nameAr: 'استشارة موارد بشرية', price: '85.000', duration: 90, description: 'HR strategy and planning' },
    { name: 'IT Support', nameAr: 'دعم تقني', price: '50.000', duration: 60, description: 'Technical support and consulting' },
  ],
};

// ===========================================
// Seeding Functions
// ===========================================

async function seedCategories() {
  console.log('📁 Seeding categories...');
  const created = [];
  
  for (const cat of CATEGORIES) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        nameAr: cat.nameAr,
      },
      create: {
        name: cat.name,
        nameAr: cat.nameAr,
        slug: cat.slug,
        isActive: true,
      },
    });
    created.push(category);
  }
  
  console.log(`   ✅ ${created.length} categories ready\n`);
  return created;
}

async function seedUsers() {
  console.log('👥 Seeding test users...');
  
  // Log database identity for verification
  console.log('   🔍 Database Identity Check:');
  const dbInfo: any = await prisma.$queryRaw`SELECT current_database() as db, inet_server_addr()::text as host`;
  console.log(`      Database: ${dbInfo[0]?.db || 'unknown'}`);
  console.log(`      Host: ${dbInfo[0]?.host || 'unknown'}`);
  console.log(`      APP_ENVIRONMENT: ${process.env.APP_ENVIRONMENT || 'not set'}`);
  console.log('');
  
  const created = [];
  
  // First, ensure permanent test accounts exist (NEVER DELETE)
  console.log('   🔒 Upserting permanent test accounts...');
  for (const userData of PERMANENT_TEST_ACCOUNTS) {
    const user = await prisma.user.upsert({
      where: { phone: userData.phone },
      update: {
        name: userData.name,
        email: userData.email,
        role: userData.role,
        status: 'VERIFIED',
      },
      create: {
        phone: userData.phone,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        status: 'VERIFIED',
      },
    });
    created.push(user);
    console.log(`      ✓ ${user.phone} (${user.role}) [ID: ${user.id}]`);
  }
  
  // VERIFICATION: Immediately query permanent test accounts to confirm persistence
  console.log('   🔍 Verifying permanent test accounts in database...');
  const verifyPhones = PERMANENT_TEST_ACCOUNTS.map(a => a.phone);
  const verifiedUsers = await prisma.user.findMany({
    where: {
      phone: { in: verifyPhones }
    },
    select: {
      id: true,
      phone: true,
      role: true,
      status: true,
    }
  });
  console.log(`      Found ${verifiedUsers.length}/${PERMANENT_TEST_ACCOUNTS.length} permanent test accounts`);
  for (const u of verifiedUsers) {
    console.log(`      ✓ ${u.phone} → ${u.role} [ID: ${u.id.substring(0, 8)}...] [Status: ${u.status}]`);
  }
  if (verifiedUsers.length !== PERMANENT_TEST_ACCOUNTS.length) {
    console.error(`      ❌ ERROR: Expected ${PERMANENT_TEST_ACCOUNTS.length} permanent accounts, found ${verifiedUsers.length}`);
    console.error('      Seed did NOT persist! Check for transaction rollback or database connection issues.');
    throw new Error('Permanent test accounts verification failed');
  }
  console.log('      ✅ All permanent test accounts verified in database');
  console.log('');
  
  // Then, create additional test users
  console.log('   📝 Upserting additional test users...');
  for (const userData of TEST_USERS) {
    const user = await prisma.user.upsert({
      where: { phone: userData.phone },
      update: {
        name: userData.name,
        role: userData.role,
        status: 'VERIFIED',
      },
      create: {
        phone: userData.phone,
        name: userData.name,
        role: userData.role,
        status: 'VERIFIED',
      },
    });
    created.push(user);
  }
  
  console.log(`   ✅ ${created.length} users ready\n`);
  return created;
}

async function seedVendors(users: any[]) {
  console.log('🏪 Seeding vendors...');
  const created = [];
  
  for (let i = 0; i < VENDORS.length; i++) {
    const vendorData = VENDORS[i];
    // Use test vendor user for first vendor, create new users for others
    const user = i === 0 
      ? users.find(u => u.role === 'VENDOR')
      : await prisma.user.upsert({
          where: { phone: vendorData.phone },
          update: { role: 'VENDOR', status: 'VERIFIED' },
          create: {
            phone: vendorData.phone,
            name: vendorData.storeName,
            role: 'VENDOR',
            status: 'VERIFIED',
          },
        });
    
    const vendor = await prisma.vendor.upsert({
      where: { userId: user.id },
      update: {
        storeName: vendorData.storeName,
        storeDescription: vendorData.description,
        category: vendorData.category,
        status: 'ACTIVE',
        subscriptionPlan: 'PROFESSIONAL',
      },
      create: {
        userId: user.id,
        storeName: vendorData.storeName,
        storeDescription: vendorData.description,
        category: vendorData.category,
        status: 'ACTIVE',
        subscriptionPlan: 'PROFESSIONAL',
      },
    });
    created.push(vendor);
  }
  
  console.log(`   ✅ ${created.length} vendors ready\n`);
  return created;
}

async function seedProducts(vendors: any[], categories: any[]) {
  console.log('📦 Seeding products...');
  let totalCreated = 0;
  
  // Map categories
  const homeKitchenCat = categories.find(c => c.slug === 'home-kitchen');
  const craftsCat = categories.find(c => c.slug === 'crafts');
  const marketCat = categories.find(c => c.slug === 'market');
  const foodTruckCat = categories.find(c => c.slug === 'food-trucks');
  
  // Seed home kitchen products (vendor 0)
  for (const prod of PRODUCTS.homeKitchen) {
    const existing = await prisma.product.findFirst({
      where: {
        vendorId: vendors[0].id,
        name: prod.name,
          slug: generateSlug(prod.name),
      },
    });

    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          nameAr: prod.nameAr,
          description: prod.description,
          price: prod.price,
          categoryId: homeKitchenCat?.id,
          isAvailable: true,
          status: 'ACTIVE',
        },
      });
    } else {
      await prisma.product.create({
        data: {
          vendorId: vendors[0].id,
          name: prod.name,
          slug: generateSlug(prod.name),
          nameAr: prod.nameAr,
          description: prod.description,
          price: prod.price,
          categoryId: homeKitchenCat?.id,
          isAvailable: true,
          status: 'ACTIVE',
        },
      });
    }
    totalCreated++;
  }
  
  // Seed crafts products (vendor 1)
  for (const prod of PRODUCTS.crafts) {
    const existing = await prisma.product.findFirst({
      where: {
        vendorId: vendors[1].id,
        name: prod.name,
          slug: generateSlug(prod.name),
      },
    });

    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          nameAr: prod.nameAr,
          description: prod.description,
          price: prod.price,
          categoryId: craftsCat?.id,
          isAvailable: true,
          status: 'ACTIVE',
        },
      });
    } else {
      await prisma.product.create({
        data: {
          vendorId: vendors[1].id,
          name: prod.name,
          slug: generateSlug(prod.name),
          nameAr: prod.nameAr,
          description: prod.description,
          price: prod.price,
          categoryId: craftsCat?.id,
          isAvailable: true,
          status: 'ACTIVE',
        },
      });
    }
    totalCreated++;
  }
  
  // Seed market products (vendor 0)
  for (const prod of PRODUCTS.market) {
    const existing = await prisma.product.findFirst({
      where: {
        vendorId: vendors[0].id,
        name: prod.name,
          slug: generateSlug(prod.name),
      },
    });

    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          nameAr: prod.nameAr,
          description: prod.description,
          price: prod.price,
          categoryId: marketCat?.id,
          isAvailable: true,
          status: 'ACTIVE',
        },
      });
    } else {
      await prisma.product.create({
        data: {
          vendorId: vendors[0].id,
          name: prod.name,
          slug: generateSlug(prod.name),
          nameAr: prod.nameAr,
          description: prod.description,
          price: prod.price,
          categoryId: marketCat?.id,
          isAvailable: true,
          status: 'ACTIVE',
        },
      });
    }
    totalCreated++;
  }
  
  // Seed food truck products (vendor 2)
  for (const prod of PRODUCTS.foodTruck) {
    const existing = await prisma.product.findFirst({
      where: {
        vendorId: vendors[2].id,
        name: prod.name,
          slug: generateSlug(prod.name),
      },
    });

    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          nameAr: prod.nameAr,
          description: prod.description,
          price: prod.price,
          categoryId: foodTruckCat?.id,
          isAvailable: true,
          status: 'ACTIVE',
        },
      });
    } else {
      await prisma.product.create({
        data: {
          vendorId: vendors[2].id,
          name: prod.name,
          slug: generateSlug(prod.name),
          nameAr: prod.nameAr,
          description: prod.description,
          price: prod.price,
          categoryId: foodTruckCat?.id,
          isAvailable: true,
          status: 'ACTIVE',
        },
      });
    }
    totalCreated++;
  }
  
  console.log(`   ✅ ${totalCreated} products ready\n`);
}

async function seedServiceProviders(users: any[]) {
  console.log('🔧 Seeding service providers...');
  const created = [];
  
  for (let i = 0; i < SERVICE_PROVIDERS.length; i++) {
    const providerData = SERVICE_PROVIDERS[i];
    // Use test provider user for first provider, create new users for others
    const user = i === 0 
      ? users.find(u => u.role === 'PROVIDER')
      : await prisma.user.upsert({
          where: { phone: providerData.phone },
          update: { role: 'PROVIDER', status: 'VERIFIED' },
          create: {
            phone: providerData.phone,
            name: providerData.businessName,
            role: 'PROVIDER',
            status: 'VERIFIED',
          },
        });
    
    const provider = await prisma.serviceProvider.upsert({
      where: { userId: user.id },
      update: {
        businessName: providerData.businessName,
        category: providerData.category,
        description: providerData.description,
        status: 'ACTIVE',
        subscriptionPlan: 'PROFESSIONAL',
      },
      create: {
        userId: user.id,
        businessName: providerData.businessName,
        category: providerData.category,
        description: providerData.description,
        status: 'ACTIVE',
        subscriptionPlan: 'PROFESSIONAL',
      },
    });
    created.push(provider);
  }
  
  console.log(`   ✅ ${created.length} service providers ready\n`);
  return created;
}

async function seedServices(providers: any[], categories: any[]) {
  console.log('🛠️  Seeding services...');
  let totalCreated = 0;
  
  // Map categories
  const homeServicesCat = categories.find(c => c.slug === 'home-services');
  const personalServicesCat = categories.find(c => c.slug === 'personal-services');
  const professionalServicesCat = categories.find(c => c.slug === 'professional-services');
  
  // Seed home services (provider 0)
  for (const svc of SERVICES.home) {
    const existing = await prisma.service.findFirst({
      where: {
        providerId: providers[0].id,
        name: svc.name,
      },
    });

    if (existing) {
      await prisma.service.update({
        where: { id: existing.id },
        data: {
          nameAr: svc.nameAr,
          description: svc.description,
          price: svc.price,
          serviceType: 'APPOINTMENT',
          durationMinutes: svc.duration,
          categoryId: homeServicesCat?.id,
          isAvailable: true,
          status: 'ACTIVE',
        },
      });
    } else {
      await prisma.service.create({
        data: {
          providerId: providers[0].id,
          name: svc.name,
          nameAr: svc.nameAr,
          slug: generateSlug(svc.name),
          description: svc.description,
          price: svc.price,
          serviceType: 'APPOINTMENT',
          durationMinutes: svc.duration,
          categoryId: homeServicesCat?.id,
          isAvailable: true,
          status: 'ACTIVE',
        },
      });
    }
    totalCreated++;
  }
  
  // Seed personal services (provider 1)
  for (const svc of SERVICES.personal) {
    const existing = await prisma.service.findFirst({
      where: {
        providerId: providers[1].id,
        name: svc.name,
      },
    });

    if (existing) {
      await prisma.service.update({
        where: { id: existing.id },
        data: {
          nameAr: svc.nameAr,
          description: svc.description,
          price: svc.price,
          serviceType: 'APPOINTMENT',
          durationMinutes: svc.duration,
          categoryId: personalServicesCat?.id,
          isAvailable: true,
          status: 'ACTIVE',
        },
      });
    } else {
      await prisma.service.create({
        data: {
          providerId: providers[1].id,
          name: svc.name,
          nameAr: svc.nameAr,
          slug: generateSlug(svc.name),
          description: svc.description,
          price: svc.price,
          serviceType: 'APPOINTMENT',
          durationMinutes: svc.duration,
          categoryId: personalServicesCat?.id,
          isAvailable: true,
          status: 'ACTIVE',
        },
      });
    }
    totalCreated++;
  }
  
  // Seed professional services (provider 2)
  for (const svc of SERVICES.professional) {
    const existing = await prisma.service.findFirst({
      where: {
        providerId: providers[2].id,
        name: svc.name,
      },
    });

    if (existing) {
      await prisma.service.update({
        where: { id: existing.id },
        data: {
          nameAr: svc.nameAr,
          description: svc.description,
          price: svc.price,
          serviceType: 'APPOINTMENT',
          durationMinutes: svc.duration,
          categoryId: professionalServicesCat?.id,
          isAvailable: true,
          status: 'ACTIVE',
        },
      });
    } else {
      await prisma.service.create({
        data: {
          providerId: providers[2].id,
          name: svc.name,
          nameAr: svc.nameAr,
          slug: generateSlug(svc.name),
          description: svc.description,
          price: svc.price,
          serviceType: 'APPOINTMENT',
          durationMinutes: svc.duration,
          categoryId: professionalServicesCat?.id,
          isAvailable: true,
          status: 'ACTIVE',
        },
      });
    }
    totalCreated++;
  }
  
  console.log(`   ✅ ${totalCreated} services ready\n`);
}

// ===========================================
// Main Seeding Function
// ===========================================

async function main() {
  // Ensure we're running on staging
  await ensureStagingEnvironment();
  
  console.log('🌱 Starting comprehensive staging data seeding...\n');
  console.log('═══════════════════════════════════════════════════\n');

  // Seed in order (respecting foreign key dependencies)
  const categories = await seedCategories();
  const users = await seedUsers();
  const vendors = await seedVendors(users);
  await seedProducts(vendors, categories);
  const providers = await seedServiceProviders(users);
  await seedServices(providers, categories);

  console.log('═══════════════════════════════════════════════════\n');
  console.log('📊 Seeding Summary:\n');
  console.log(`   📁 Categories: ${categories.length}`);
  console.log(`   👥 Test Users: ${users.length}`);
  console.log(`   🏪 Vendors: ${vendors.length}`);
  console.log(`   📦 Products: ${PRODUCTS.homeKitchen.length + PRODUCTS.crafts.length + PRODUCTS.market.length + PRODUCTS.foodTruck.length}`);
  console.log(`   🔧 Service Providers: ${providers.length}`);
  console.log(`   🛠️  Services: ${SERVICES.home.length + SERVICES.personal.length + SERVICES.professional.length}`);
  console.log();

  console.log('🎯 Test Data Ready!\n');
  console.log('📝 Test User Credentials:');
  TEST_USERS.forEach(u => {
    console.log(`   ${u.role}: ${u.phone} (${u.name})`);
  });
  console.log();

  console.log('🔗 API Endpoints to Test:');
  console.log('   GET /api/v1/categories');
  console.log('   GET /api/v1/products');
  console.log('   GET /api/v1/services');
  console.log();

  console.log('✅ Staging data seeding complete!');
}

main()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
