/**
 * Upload Middleware - Nasneh API
 * Multer configuration for file uploads
 */

import multer, { Multer } from 'multer';
import { RequestHandler } from 'express';
import {
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  MAX_FILES_PER_REQUEST,
  FileValidationError,
} from '../types/upload.types.js';

/**
 * Multer storage configuration
 * Using memory storage for S3 uploads
 */
const storage = multer.memoryStorage();

/**
 * File filter - validates file type
 */
const fileFilter: multer.Options['fileFilter'] = (req, file, cb) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype as any)) {
    cb(null, true);
  } else {
    cb(new FileValidationError(
      `Invalid file type: ${file.mimetype}. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`
    ));
  }
};

/**
 * Multer instance for single image upload
 */
export const uploadSingle: RequestHandler = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
}).single('image');

/**
 * Multer instance for multiple image upload
 */
export const uploadMultiple: RequestHandler = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES_PER_REQUEST,
  },
}).array('images', MAX_FILES_PER_REQUEST);

/**
 * Error handler for multer errors
 */
export function handleMulterError(error: any): FileValidationError | null {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return new FileValidationError(
          `File too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`
        );
      case 'LIMIT_FILE_COUNT':
        return new FileValidationError(
          `Too many files. Maximum: ${MAX_FILES_PER_REQUEST}`
        );
      case 'LIMIT_UNEXPECTED_FILE':
        return new FileValidationError(
          `Unexpected field name. Use 'image' for single upload or 'images' for multiple`
        );
      default:
        return new FileValidationError(`Upload error: ${error.message}`);
    }
  }
  return null;
}
