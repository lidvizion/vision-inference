import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { logInfo, logSecurity } from './logger'
import { MetricsUtils } from './tracing'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// File validation utilities
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/svg+xml'
] as const;

export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
  'video/x-msvideo'
] as const;

export const ALLOWED_FILE_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES] as const;

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateFile(file: File): FileValidationResult {
  // Synchronous validation for immediate return
  logInfo('Starting file validation', {
    component: 'file-validation',
    operation: 'validate',
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
  });

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    logSecurity('File size validation failed', {
      component: 'file-validation',
      operation: 'validate',
      fileName: file.name,
      fileSize: file.size,
      maxSize: MAX_FILE_SIZE,
    });
    
    return {
      isValid: false,
      error: `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds maximum allowed size of 50MB`
    };
  }

  // Check MIME type
  if (!ALLOWED_FILE_TYPES.includes(file.type as typeof ALLOWED_FILE_TYPES[number])) {
    logSecurity('File type validation failed', {
      component: 'file-validation',
      operation: 'validate',
      fileName: file.name,
      fileType: file.type,
      allowedTypes: ALLOWED_FILE_TYPES,
    });
    
    return {
      isValid: false,
      error: `File type "${file.type}" is not supported. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`
    };
  }

  // Sanitize filename
  const sanitizedFileName = sanitizeFileName(file.name);
  if (sanitizedFileName !== file.name) {
    logSecurity('Filename sanitized', {
      component: 'file-validation',
      operation: 'sanitize',
      originalName: file.name,
      sanitizedName: sanitizedFileName,
    });
  }

  logInfo('File validation completed successfully', {
    component: 'file-validation',
    operation: 'validate',
    fileName: sanitizedFileName,
    fileSize: file.size,
    fileType: file.type,
  });

  // Record metrics
  MetricsUtils.recordFileUpload(sanitizedFileName, file.size, true);

  return { isValid: true };
}

export function sanitizeFileName(fileName: string): string {
  // Remove or replace potentially dangerous characters
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
    .substring(0, 255); // Limit length
}

export function getFileTypeCategory(mimeType: string): 'image' | 'video' | 'unknown' {
  if (ALLOWED_IMAGE_TYPES.includes(mimeType as typeof ALLOWED_IMAGE_TYPES[number])) return 'image';
  if (ALLOWED_VIDEO_TYPES.includes(mimeType as typeof ALLOWED_VIDEO_TYPES[number])) return 'video';
  return 'unknown';
}
