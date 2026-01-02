/**
 * Upload Service - Nasneh API
 * Business logic for file uploads
 * Following ClickUp task requirements
 */

import { smartUpload, deleteFromS3, extractKeyFromUrl } from '../../lib/s3.js';
import {
  UploadedFile,
  UploadResult,
  UploadCategory,
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  MAX_FILES_PER_REQUEST,
  FileValidationError,
} from '../../types/upload.types.js';

export class UploadService {
  /**
   * Validate a single file
   */
  validateFile(file: UploadedFile): void {
    // Check file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype as any)) {
      throw new FileValidationError(
        `Invalid file type: ${file.mimetype}. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`
      );
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      throw new FileValidationError(
        `File too large: ${fileSizeMB}MB. Maximum size: ${maxSizeMB}MB`
      );
    }
  }

  /**
   * Validate multiple files
   */
  validateFiles(files: UploadedFile[]): void {
    if (!files || files.length === 0) {
      throw new FileValidationError('No files provided');
    }

    if (files.length > MAX_FILES_PER_REQUEST) {
      throw new FileValidationError(
        `Too many files: ${files.length}. Maximum: ${MAX_FILES_PER_REQUEST}`
      );
    }

    // Validate each file
    for (const file of files) {
      this.validateFile(file);
    }
  }

  /**
   * Upload a single image
   */
  async uploadImage(
    file: UploadedFile,
    category: UploadCategory = UploadCategory.PRODUCT
  ): Promise<UploadResult> {
    // Validate file
    this.validateFile(file);

    // Upload to S3
    const result = await smartUpload(
      file.buffer,
      file.originalname,
      file.mimetype,
      category
    );

    return result;
  }

  /**
   * Upload multiple images
   */
  async uploadImages(
    files: UploadedFile[],
    category: UploadCategory = UploadCategory.PRODUCT
  ): Promise<UploadResult[]> {
    // Validate all files first
    this.validateFiles(files);

    // Upload all files in parallel
    const results = await Promise.all(
      files.map((file) => smartUpload(file.buffer, file.originalname, file.mimetype, category))
    );

    return results;
  }

  /**
   * Delete an image by URL
   */
  async deleteImage(url: string): Promise<void> {
    const key = extractKeyFromUrl(url);
    if (key) {
      await deleteFromS3(key);
    }
  }

  /**
   * Delete multiple images by URLs
   */
  async deleteImages(urls: string[]): Promise<void> {
    await Promise.all(urls.map((url) => this.deleteImage(url)));
  }
}

// Export singleton instance
export const uploadService = new UploadService();
