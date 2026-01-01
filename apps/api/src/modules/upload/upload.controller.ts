/**
 * Upload Controller - Nasneh API
 * Handles HTTP requests for file uploads
 * Following ClickUp task requirements
 */

import { Request, Response, NextFunction } from 'express';
import { uploadService } from './upload.service';
import {
  UploadCategory,
  FileValidationError,
  UploadError,
} from '../../types/upload.types';

/**
 * Upload Single Image
 * POST /upload/image
 */
export async function uploadImage(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const file = req.file;

    if (!file) {
      res.status(400).json({
        success: false,
        error: 'No file provided',
      });
      return;
    }

    // Get category from query or default to product
    const category = (req.query.category as UploadCategory) || UploadCategory.PRODUCT;

    // Convert Express.Multer.File to our UploadedFile format
    const uploadedFile = {
      fieldname: file.fieldname,
      originalname: file.originalname,
      encoding: file.encoding,
      mimetype: file.mimetype,
      buffer: file.buffer,
      size: file.size,
    };

    const result = await uploadService.uploadImage(uploadedFile, category);

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      url: result.url,
    });
  } catch (error) {
    if (error instanceof FileValidationError) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
      return;
    }
    if (error instanceof UploadError) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
      return;
    }
    next(error);
  }
}

/**
 * Upload Multiple Images
 * POST /upload/images
 */
export async function uploadImages(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res.status(400).json({
        success: false,
        error: 'No files provided',
      });
      return;
    }

    // Get category from query or default to product
    const category = (req.query.category as UploadCategory) || UploadCategory.PRODUCT;

    // Convert Express.Multer.File[] to our UploadedFile[] format
    const uploadedFiles = files.map((file) => ({
      fieldname: file.fieldname,
      originalname: file.originalname,
      encoding: file.encoding,
      mimetype: file.mimetype,
      buffer: file.buffer,
      size: file.size,
    }));

    const results = await uploadService.uploadImages(uploadedFiles, category);

    res.status(200).json({
      success: true,
      message: `${results.length} image(s) uploaded successfully`,
      urls: results.map((r) => r.url),
    });
  } catch (error) {
    if (error instanceof FileValidationError) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
      return;
    }
    if (error instanceof UploadError) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
      return;
    }
    next(error);
  }
}

/**
 * Delete Image
 * DELETE /upload/image
 */
export async function deleteImage(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { url } = req.body;

    if (!url) {
      res.status(400).json({
        success: false,
        error: 'URL is required',
      });
      return;
    }

    await uploadService.deleteImage(url);

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}
