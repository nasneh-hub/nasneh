/**
 * Upload Types - Nasneh API
 * Following ClickUp task requirements
 */

import { z } from 'zod';

// ===========================================
// Constants
// ===========================================

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
export const MAX_FILES_PER_REQUEST = 10;

// ===========================================
// Enums
// ===========================================

export const UploadCategory = {
  PRODUCT: 'product',
  VENDOR: 'vendor',
  PROVIDER: 'provider',
  USER: 'user',
} as const;

export type UploadCategory = (typeof UploadCategory)[keyof typeof UploadCategory];

// ===========================================
// Validation Schemas
// ===========================================

export const uploadImageSchema = z.object({
  category: z.nativeEnum(UploadCategory as any).default(UploadCategory.PRODUCT),
});

// ===========================================
// Types
// ===========================================

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export interface UploadResult {
  url: string;
  key: string;
  size: number;
  mimetype: string;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  url: string;
}

export interface MultiUploadResponse {
  success: boolean;
  message: string;
  urls: string[];
}

// ===========================================
// Error Types
// ===========================================

export class FileValidationError extends Error {
  public statusCode = 400;

  constructor(message: string) {
    super(message);
    this.name = 'FileValidationError';
  }
}

export class UploadError extends Error {
  public statusCode = 500;

  constructor(message: string) {
    super(message);
    this.name = 'UploadError';
  }
}
