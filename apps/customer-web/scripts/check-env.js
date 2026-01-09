#!/usr/bin/env node
/**
 * Build Guard: Environment Variable Validation
 * =============================================
 * This script validates environment variables before build/start.
 * 
 * Prevents common misconfigurations:
 * - Localhost URLs in staging/production
 * - Missing required environment variables
 * 
 * Usage: node scripts/check-env.js
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const APP_ENV = process.env.NEXT_PUBLIC_APP_ENV || 'development';

console.log('🔍 Validating environment configuration...');
console.log(`   Environment: ${APP_ENV}`);
console.log(`   API URL: ${API_URL || '(not set)'}`);

// Check if API_URL is set
if (!API_URL) {
  // In development, allow missing API_URL (will use fallback)
  if (APP_ENV === 'development') {
    console.warn('\n⚠️  WARNING: NEXT_PUBLIC_API_URL is not set');
    console.warn('   Using default development configuration.');
    console.log('✅ Environment configuration validated (development mode)\n');
    process.exit(0);
  }
  
  console.error('\n❌ ERROR: NEXT_PUBLIC_API_URL is not set');
  console.error('   Please set this environment variable before building.');
  console.error('   Example: NEXT_PUBLIC_API_URL=https://api-staging.nasneh.com/api/v1');
  process.exit(1);
}

// Check for localhost in staging/production
if (APP_ENV === 'staging' || APP_ENV === 'production') {
  if (API_URL.includes('localhost') || API_URL.includes('127.0.0.1')) {
    console.error(`\n❌ ERROR: API URL contains localhost in ${APP_ENV} environment`);
    console.error(`   Current API URL: ${API_URL}`);
    console.error(`   Expected format: https://api-${APP_ENV}.nasneh.com/api/v1`);
    console.error('\n   This is a critical misconfiguration that will cause runtime errors.');
    console.error('   Please update the environment variable before deploying.');
    process.exit(1);
  }
}

// Check for proper HTTPS in staging/production
if (APP_ENV === 'staging' || APP_ENV === 'production') {
  if (!API_URL.startsWith('https://')) {
    console.error(`\n❌ ERROR: API URL must use HTTPS in ${APP_ENV} environment`);
    console.error(`   Current API URL: ${API_URL}`);
    console.error(`   Expected format: https://api-${APP_ENV}.nasneh.com/api/v1`);
    process.exit(1);
  }
}

// Check for /api/v1 suffix
if (!API_URL.endsWith('/api/v1')) {
  console.warn('\n⚠️  WARNING: API URL does not end with /api/v1');
  console.warn(`   Current API URL: ${API_URL}`);
  console.warn(`   Expected format: ${API_URL.replace(/\/$/, '')}/api/v1`);
  console.warn('   This may cause API requests to fail.');
  // Don't exit, just warn (in case there's a valid reason)
}

console.log('✅ Environment configuration validated successfully\n');
