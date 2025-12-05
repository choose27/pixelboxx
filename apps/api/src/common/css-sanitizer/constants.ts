/**
 * CSS Sanitization Constants
 *
 * Whitelist approach: Only allow safe CSS properties
 * Block all known XSS vectors and dangerous patterns
 */

// Allowed CSS properties (whitelist approach)
export const ALLOWED_PROPERTIES = new Set([
  // Layout
  'display',
  'position',
  'top',
  'right',
  'bottom',
  'left',
  'float',
  'clear',
  'width',
  'height',
  'min-width',
  'max-width',
  'min-height',
  'max-height',
  'margin',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'padding',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'box-sizing',

  // Flexbox
  'flex',
  'flex-direction',
  'flex-wrap',
  'flex-flow',
  'flex-grow',
  'flex-shrink',
  'flex-basis',
  'justify-content',
  'align-items',
  'align-content',
  'align-self',
  'order',

  // Grid
  'grid',
  'grid-template',
  'grid-template-columns',
  'grid-template-rows',
  'grid-template-areas',
  'grid-auto-columns',
  'grid-auto-rows',
  'grid-auto-flow',
  'grid-column',
  'grid-column-start',
  'grid-column-end',
  'grid-row',
  'grid-row-start',
  'grid-row-end',
  'grid-area',
  'gap',
  'row-gap',
  'column-gap',

  // Visual
  'background',
  'background-color',
  'background-image',
  'background-position',
  'background-size',
  'background-repeat',
  'background-origin',
  'background-clip',
  'background-attachment',
  'background-blend-mode',
  'border',
  'border-width',
  'border-style',
  'border-color',
  'border-top',
  'border-right',
  'border-bottom',
  'border-left',
  'border-top-width',
  'border-top-style',
  'border-top-color',
  'border-right-width',
  'border-right-style',
  'border-right-color',
  'border-bottom-width',
  'border-bottom-style',
  'border-bottom-color',
  'border-left-width',
  'border-left-style',
  'border-left-color',
  'border-radius',
  'border-top-left-radius',
  'border-top-right-radius',
  'border-bottom-left-radius',
  'border-bottom-right-radius',
  'box-shadow',
  'opacity',
  'visibility',
  'overflow',
  'overflow-x',
  'overflow-y',
  'clip',
  'clip-path',

  // Typography
  'color',
  'font',
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
  'font-variant',
  'line-height',
  'letter-spacing',
  'word-spacing',
  'text-align',
  'text-decoration',
  'text-decoration-line',
  'text-decoration-color',
  'text-decoration-style',
  'text-transform',
  'text-indent',
  'text-shadow',
  'white-space',
  'word-break',
  'word-wrap',
  'overflow-wrap',
  'text-overflow',
  'vertical-align',

  // Transform & Animation
  'transform',
  'transform-origin',
  'transform-style',
  'perspective',
  'perspective-origin',
  'backface-visibility',
  'transition',
  'transition-property',
  'transition-duration',
  'transition-timing-function',
  'transition-delay',
  'animation',
  'animation-name',
  'animation-duration',
  'animation-timing-function',
  'animation-delay',
  'animation-iteration-count',
  'animation-direction',
  'animation-fill-mode',
  'animation-play-state',

  // Other safe properties
  'cursor',
  'z-index',
  'filter',
  'backdrop-filter',
  'mix-blend-mode',
  'object-fit',
  'object-position',
  'outline',
  'outline-width',
  'outline-style',
  'outline-color',
  'outline-offset',
  'list-style',
  'list-style-type',
  'list-style-position',
  'list-style-image',
  'pointer-events',
  'user-select',
]);

// Dangerous patterns to block (XSS vectors)
export const BLOCKED_PATTERNS = [
  /expression\s*\(/gi,              // IE expression() exploit
  /javascript\s*:/gi,               // javascript: URLs
  /behavior\s*:/gi,                 // IE behavior
  /@import/gi,                      // External imports
  /url\s*\(\s*["']?\s*data:/gi,     // Data URLs (potential XSS)
  /<script/gi,                      // Script tags
  /<\/script/gi,                    // Closing script tags
  /onclick/gi,                      // Event handlers
  /onerror/gi,
  /onload/gi,
  /onmouseover/gi,
  /onfocus/gi,
  /onblur/gi,
  /onchange/gi,
  /onsubmit/gi,
  /onkeydown/gi,
  /onkeyup/gi,
  /onkeypress/gi,
  /onmousedown/gi,
  /onmouseup/gi,
  /onmousemove/gi,
  /onmouseout/gi,
  /onmouseenter/gi,
  /onmouseleave/gi,
  /vbscript\s*:/gi,                 // VBScript URLs
  /mhtml\s*:/gi,                    // MHTML
  /binding\s*:/gi,                  // XBL binding
  /-moz-binding/gi,                 // Mozilla binding
];

// Allowed URL protocols for background-image, etc.
export const ALLOWED_URL_PROTOCOLS = ['https:', 'http:', '/'];

// Maximum CSS size (to prevent DoS)
export const MAX_CSS_SIZE = 100 * 1024; // 100KB

// Maximum number of rules (to prevent DoS)
export const MAX_RULES = 1000;

// At-rules that are allowed
export const ALLOWED_AT_RULES = new Set([
  '@keyframes',
  '@media',
]);
