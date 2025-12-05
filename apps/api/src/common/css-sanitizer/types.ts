/**
 * Type definitions for CSS sanitization
 */

export interface SanitizeResult {
  /** Sanitized and scoped CSS */
  clean: string;
  /** Properties/rules that were removed and why */
  removed: string[];
  /** Non-blocking warnings */
  warnings: string[];
  /** Whether sanitization was successful */
  success: boolean;
}

export interface ValidationResult {
  /** Whether the CSS is valid */
  valid: boolean;
  /** Validation errors */
  errors: string[];
  /** Validation warnings */
  warnings: string[];
}

export interface CssRule {
  /** Selector(s) for the rule */
  selector: string;
  /** CSS declarations */
  declarations: CssDeclaration[];
  /** Original rule text */
  original: string;
}

export interface CssDeclaration {
  /** Property name */
  property: string;
  /** Property value */
  value: string;
  /** Is this property allowed? */
  allowed: boolean;
  /** Reason for blocking (if blocked) */
  blockReason?: string;
}

export interface CssAtRule {
  /** At-rule name (e.g., @keyframes, @media) */
  name: string;
  /** At-rule parameters */
  params: string;
  /** Rules inside the at-rule */
  rules: CssRule[];
  /** Original text */
  original: string;
}
