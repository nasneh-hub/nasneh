/**
 * S3 Service - Nasneh API
 * AWS S3 client for file uploads
 * Following TECHNICAL_SPEC.md - AWS Bahrain (me-south-1)
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { config } from '../config/env.js';
import { UploadResult, UploadCategory, UploadError } from '../types/upload.types.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// ===========================================
// S3 Client
// ===========================================

const s3Client = new S3Client({
  region: config.aws.s3Region,
  // Credentials are loaded from environment or IAM role
});

// ===========================================
// Helper Functions
// ===========================================

/**
 * Generate a unique S3 key for the file
 * Format: {category}/{year}/{month}/{uuid}.{ext}
 */
function generateS3Key(category: UploadCategory, originalFilename: string): string {
  const ext = path.extname(originalFilename).toLowerCase() || '.jpg';
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const uniqueId = uuidv4();

  return `${category}/${year}/${month}/${uniqueId}${ext}`;
}

/**
 * Get the public URL for an S3 object
 */
function getPublicUrl(key: string): string {
  return `https://${config.aws.s3Bucket}.s3.${config.aws.s3Region}.amazonaws.com/${key}`;
}

// ===========================================
// Upload Functions
// ===========================================

/**
 * Upload a file to S3
 */
export async function uploadToS3(
  buffer: Buffer,
  originalFilename: string,
  mimetype: string,
  category: UploadCategory = UploadCategory.PRODUCT
): Promise<UploadResult> {
  const key = generateS3Key(category, originalFilename);

  try {
    const command = new PutObjectCommand({
      Bucket: config.aws.s3Bucket,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
      // Make the file publicly readable
      ACL: 'public-read',
      // Cache for 1 year (immutable content)
      CacheControl: 'max-age=31536000, immutable',
    });

    await s3Client.send(command);

    return {
      url: getPublicUrl(key),
      key,
      size: buffer.length,
      mimetype,
    };
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new UploadError('Failed to upload file to storage');
  }
}

/**
 * Delete a file from S3
 */
export async function deleteFromS3(key: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: config.aws.s3Bucket,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error('S3 delete error:', error);
    // Don't throw - deletion failures shouldn't break the app
  }
}

/**
 * Extract S3 key from URL
 */
export function extractKeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    // Remove leading slash
    return urlObj.pathname.slice(1);
  } catch {
    return null;
  }
}

// ===========================================
// Mock S3 for Development
// ===========================================

/**
 * Mock upload for development without AWS credentials
 * Returns a placeholder URL
 */
export async function mockUploadToS3(
  buffer: Buffer,
  originalFilename: string,
  mimetype: string,
  category: UploadCategory = UploadCategory.PRODUCT
): Promise<UploadResult> {
  const key = generateS3Key(category, originalFilename);

  // In development, return a mock URL
  // This allows testing without AWS credentials
  const mockUrl = `https://mock-s3.nasneh.local/${config.aws.s3Bucket}/${key}`;

  console.log(`[DEV] Mock S3 upload: ${key} (${buffer.length} bytes)`);

  return {
    url: mockUrl,
    key,
    size: buffer.length,
    mimetype,
  };
}

/**
 * Smart upload - uses mock in development if AWS not configured
 */
export async function smartUpload(
  buffer: Buffer,
  originalFilename: string,
  mimetype: string,
  category: UploadCategory = UploadCategory.PRODUCT
): Promise<UploadResult> {
  // Check if AWS credentials are configured
  const hasAwsCredentials = Boolean(
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
  );

  if (config.isDevelopment && !hasAwsCredentials) {
    return mockUploadToS3(buffer, originalFilename, mimetype, category);
  }

  return uploadToS3(buffer, originalFilename, mimetype, category);
}
