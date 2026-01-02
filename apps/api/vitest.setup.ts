/**
 * Vitest Setup - Load test environment variables
 * This file runs before all tests to ensure env vars are set
 */
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.test file before any tests run
config({ path: resolve(__dirname, '.env.test') });

// Ensure NODE_ENV is set to test
process.env.NODE_ENV = 'test';
