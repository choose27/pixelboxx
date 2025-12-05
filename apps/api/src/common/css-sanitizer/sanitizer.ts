/**
 * CSS Sanitization Engine
 *
 * Sanitizes user-submitted CSS to prevent XSS and other security issues
 * Uses a whitelist approach - only allows known-safe CSS properties
 */

import {
  ALLOWED_PROPERTIES,
  BLOCKED_PATTERNS,
  ALLOWED_URL_PROTOCOLS,
  MAX_CSS_SIZE,
  MAX_RULES,
  ALLOWED_AT_RULES,
} from './constants';
import { SanitizeResult, ValidationResult, CssDeclaration } from './types';

export class CssSanitizer {
  /**
   * Sanitize CSS and scope it to a specific username
   */
  sanitizeCSS(css: string, username: string): SanitizeResult {
    const result: SanitizeResult = {
      clean: '',
      removed: [],
      warnings: [],
      success: true,
    };

    // Check size limits
    if (css.length > MAX_CSS_SIZE) {
      result.success = false;
      result.removed.push(
        `CSS exceeds maximum size of ${MAX_CSS_SIZE} bytes (got ${css.length})`,
      );
      return result;
    }

    // Check for blocked patterns first
    for (const pattern of BLOCKED_PATTERNS) {
      if (pattern.test(css)) {
        result.removed.push(
          `Blocked dangerous pattern: ${pattern.source}`,
        );
        css = css.replace(pattern, '/* BLOCKED */');
      }
    }

    try {
      // Parse and sanitize CSS
      const sanitized = this.parseAndSanitize(css, result);

      // Scope CSS to username
      const scoped = this.scopeCSS(sanitized, username);

      // Count rules
      const ruleCount = (scoped.match(/\{/g) || []).length;
      if (ruleCount > MAX_RULES) {
        result.warnings.push(
          `CSS has ${ruleCount} rules (maximum ${MAX_RULES}). Some rules may not apply.`,
        );
        // Truncate to max rules
        result.clean = this.truncateToMaxRules(scoped, MAX_RULES);
      } else {
        result.clean = scoped;
      }
    } catch (error) {
      result.success = false;
      result.removed.push(
        `Parse error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      result.clean = '';
    }

    return result;
  }

  /**
   * Validate CSS without applying it
   */
  validateCSS(css: string): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
    };

    if (css.length > MAX_CSS_SIZE) {
      result.valid = false;
      result.errors.push(
        `CSS exceeds maximum size of ${MAX_CSS_SIZE} bytes`,
      );
    }

    for (const pattern of BLOCKED_PATTERNS) {
      if (pattern.test(css)) {
        result.valid = false;
        result.errors.push(`Contains blocked pattern: ${pattern.source}`);
      }
    }

    return result;
  }

  /**
   * Parse and sanitize CSS rules
   */
  private parseAndSanitize(css: string, result: SanitizeResult): string {
    const sanitizedParts: string[] = [];

    // Simple CSS parser (handles basic rules and @keyframes/@media)
    const ruleRegex = /([^{]+)\{([^}]+)\}/g;
    let match;
    let processedRules = 0;

    while ((match = ruleRegex.exec(css)) !== null) {
      if (processedRules >= MAX_RULES) {
        result.warnings.push('Maximum rule count reached, remaining rules ignored');
        break;
      }

      const selector = match[1].trim();
      const declarations = match[2];

      // Handle @-rules
      if (selector.startsWith('@')) {
        const atRuleName = selector.split(/\s+/)[0];
        if (ALLOWED_AT_RULES.has(atRuleName)) {
          // For @keyframes and @media, include them
          sanitizedParts.push(`${selector} { ${declarations} }`);
        } else {
          result.removed.push(`Blocked at-rule: ${atRuleName}`);
        }
      } else {
        // Regular rule - sanitize declarations
        const sanitizedDeclarations = this.sanitizeDeclarations(
          declarations,
          result,
        );
        if (sanitizedDeclarations.trim()) {
          sanitizedParts.push(`${selector} { ${sanitizedDeclarations} }`);
        }
      }

      processedRules++;
    }

    return sanitizedParts.join('\n');
  }

  /**
   * Sanitize CSS declarations within a rule
   */
  private sanitizeDeclarations(
    declarations: string,
    result: SanitizeResult,
  ): string {
    const sanitized: string[] = [];
    const declarationParts = declarations.split(';');

    for (const decl of declarationParts) {
      const trimmed = decl.trim();
      if (!trimmed) continue;

      const colonIndex = trimmed.indexOf(':');
      if (colonIndex === -1) continue;

      const property = trimmed.substring(0, colonIndex).trim().toLowerCase();
      const value = trimmed.substring(colonIndex + 1).trim();

      // Check if property is allowed
      if (!ALLOWED_PROPERTIES.has(property)) {
        result.removed.push(`Blocked property: ${property}`);
        continue;
      }

      // Sanitize value
      const sanitizedValue = this.sanitizeValue(value, property, result);
      if (sanitizedValue) {
        sanitized.push(`${property}: ${sanitizedValue}`);
      }
    }

    return sanitized.join('; ');
  }

  /**
   * Sanitize a CSS value
   */
  private sanitizeValue(
    value: string,
    property: string,
    result: SanitizeResult,
  ): string {
    // Check for blocked patterns in value
    for (const pattern of BLOCKED_PATTERNS) {
      if (pattern.test(value)) {
        result.removed.push(
          `Blocked dangerous pattern in value for ${property}: ${pattern.source}`,
        );
        return '';
      }
    }

    // Validate URLs in background-image, etc.
    if (value.includes('url(')) {
      const validatedUrl = this.validateUrls(value, property, result);
      if (!validatedUrl) return '';
      return validatedUrl;
    }

    return value;
  }

  /**
   * Validate and sanitize URLs in CSS values
   */
  private validateUrls(
    value: string,
    property: string,
    result: SanitizeResult,
  ): string {
    const urlRegex = /url\s*\(\s*(['"]?)([^'"()]+)\1\s*\)/gi;
    let hasInvalidUrl = false;

    const sanitized = value.replace(urlRegex, (match, quote, url) => {
      const trimmedUrl = url.trim();

      // Block data URLs
      if (trimmedUrl.toLowerCase().startsWith('data:')) {
        result.removed.push(
          `Blocked data URL in ${property}: ${trimmedUrl.substring(0, 50)}...`,
        );
        hasInvalidUrl = true;
        return '';
      }

      // Check protocol
      const hasProtocol = /^[a-z]+:/i.test(trimmedUrl);
      if (hasProtocol) {
        const protocol = trimmedUrl.split(':')[0].toLowerCase() + ':';
        if (!ALLOWED_URL_PROTOCOLS.includes(protocol)) {
          result.removed.push(
            `Blocked URL with invalid protocol in ${property}: ${protocol}`,
          );
          hasInvalidUrl = true;
          return '';
        }
      }

      // URL is valid
      return match;
    });

    return hasInvalidUrl ? '' : sanitized;
  }

  /**
   * Scope CSS to a specific username
   * All selectors are prefixed with .pixelpage-sandbox[data-username="username"]
   */
  private scopeCSS(css: string, username: string): string {
    const scope = `.pixelpage-sandbox[data-username="${this.escapeUsername(username)}"]`;
    const scopedParts: string[] = [];

    // Parse rules and add scoping
    const ruleRegex = /([^{]+)\{([^}]+)\}/g;
    let match;

    while ((match = ruleRegex.exec(css)) !== null) {
      const selector = match[1].trim();
      const declarations = match[2];

      // Handle @-rules differently
      if (selector.startsWith('@')) {
        // For @keyframes, don't scope the name, but keep as-is
        // For @media, scope the rules inside
        if (selector.startsWith('@keyframes')) {
          scopedParts.push(`${selector} { ${declarations} }`);
        } else if (selector.startsWith('@media')) {
          // Extract media query
          const mediaQuery = selector;
          // Recursively scope the inner CSS
          const innerCss = declarations;
          const scopedInner = innerCss
            .split(/(?<=\})\s*/)
            .map((rule) => {
              if (!rule.trim()) return '';
              const innerMatch = /([^{]+)\{([^}]+)\}/.exec(rule);
              if (innerMatch) {
                const innerSelector = innerMatch[1].trim();
                const innerDeclarations = innerMatch[2];
                return `${scope} ${innerSelector} { ${innerDeclarations} }`;
              }
              return rule;
            })
            .join('\n');
          scopedParts.push(`${mediaQuery} {\n${scopedInner}\n}`);
        } else {
          scopedParts.push(`${selector} { ${declarations} }`);
        }
      } else {
        // Regular selector - add scope prefix
        const scopedSelector = `${scope} ${selector}`;
        scopedParts.push(`${scopedSelector} { ${declarations} }`);
      }
    }

    return scopedParts.join('\n');
  }

  /**
   * Escape username for use in CSS selector
   */
  private escapeUsername(username: string): string {
    // Escape special characters that could break the selector
    return username.replace(/["\\]/g, '\\$&');
  }

  /**
   * Truncate CSS to maximum number of rules
   */
  private truncateToMaxRules(css: string, maxRules: number): string {
    const ruleRegex = /[^{]+\{[^}]+\}/g;
    const matches = css.match(ruleRegex);
    if (!matches || matches.length <= maxRules) {
      return css;
    }
    return matches.slice(0, maxRules).join('\n');
  }
}

// Singleton instance
export const cssSanitizer = new CssSanitizer();
