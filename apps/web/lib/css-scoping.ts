/**
 * CSS Scoping Utility for Frontend
 *
 * Ensures user CSS is properly scoped and doesn't leak to other parts of the app
 */

/**
 * Apply scoped user CSS to a profile container
 * The backend has already sanitized and scoped the CSS
 * This just ensures it's applied safely in the DOM
 */
export function applyScopedCSS(
  username: string,
  sanitizedCSS: string,
): string {
  // The CSS from the backend is already scoped to .pixelpage-sandbox[data-username="X"]
  // We just need to return it as-is
  return sanitizedCSS;
}

/**
 * Get the data attributes for the sandbox container
 */
export function getSandboxAttributes(username: string): Record<string, string> {
  return {
    'data-username': username,
    className: 'pixelpage-sandbox',
  };
}

/**
 * Escape username for safe use in selectors
 */
export function escapeUsername(username: string): string {
  return username.replace(/["\\]/g, '\\$&');
}
