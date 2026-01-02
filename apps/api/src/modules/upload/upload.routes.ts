/**
 * Upload Routes - Nasneh API
 * Following ClickUp task requirements
 *
 * Endpoints:
 * - POST /upload/image   - Upload single image (multipart)
 * - POST /upload/images  - Upload multiple images (multipart)
 * - DELETE /upload/image - Delete image by URL
 */

import { Router, Request, Response, NextFunction } from 'express';
import { uploadImage, uploadImages, deleteImage } from './upload.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import {
  uploadSingle,
  uploadMultiple,
  handleMulterError,
} from '../../middleware/upload.middleware.js';
import { FileValidationError } from '../../types/upload.types.js';

const router: Router = Router();

/**
 * Wrapper to handle multer errors
 */
function wrapMulter(
  multerMiddleware: any,
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    multerMiddleware(req, res, (err: any) => {
      if (err) {
        const validationError = handleMulterError(err);
        if (validationError) {
          res.status(400).json({
            success: false,
            error: validationError.message,
          });
          return;
        }
        if (err instanceof FileValidationError) {
          res.status(400).json({
            success: false,
            error: err.message,
          });
          return;
        }
        next(err);
        return;
      }
      handler(req, res, next);
    });
  };
}

/**
 * @route   POST /upload/image
 * @desc    Upload single image
 * @access  Protected
 * @body    multipart/form-data with 'image' field
 * @query   category (optional): product, vendor, provider, user
 */
router.post(
  '/image',
  authMiddleware,
  wrapMulter(uploadSingle, uploadImage)
);

/**
 * @route   POST /upload/images
 * @desc    Upload multiple images (max 10)
 * @access  Protected
 * @body    multipart/form-data with 'images' field
 * @query   category (optional): product, vendor, provider, user
 */
router.post(
  '/images',
  authMiddleware,
  wrapMulter(uploadMultiple, uploadImages)
);

/**
 * @route   DELETE /upload/image
 * @desc    Delete image by URL
 * @access  Protected
 * @body    { url: string }
 */
router.delete('/image', authMiddleware, deleteImage);

export default router;
