/**
 * CSS Sanitization Module
 *
 * Export main sanitization function and types
 */

export { CssSanitizer, cssSanitizer } from './sanitizer';
export * from './types';
export * from './constants';

/**
 * Convenience function to sanitize CSS
 */
export function sanitizeCSS(css: string, username: string) {
  const { cssSanitizer } = require('./sanitizer');
  return cssSanitizer.sanitizeCSS(css, username);
}

/**
 * Convenience function to validate CSS
 */
export function validateCSS(css: string) {
  const { cssSanitizer } = require('./sanitizer');
  return cssSanitizer.validateCSS(css);
}
