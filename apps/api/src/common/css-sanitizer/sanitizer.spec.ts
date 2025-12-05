/**
 * CSS Sanitizer Tests
 *
 * Tests for known XSS vectors and security issues
 */

import { CssSanitizer } from './sanitizer';

describe('CssSanitizer', () => {
  let sanitizer: CssSanitizer;

  beforeEach(() => {
    sanitizer = new CssSanitizer();
  });

  describe('XSS Prevention', () => {
    it('should block javascript: URLs', () => {
      const css = 'body { background-image: url(javascript:alert("XSS")); }';
      const result = sanitizer.sanitizeCSS(css, 'testuser');
      expect(result.clean).not.toContain('javascript:');
      expect(result.removed.length).toBeGreaterThan(0);
    });

    it('should block data: URLs', () => {
      const css =
        'body { background-image: url(data:text/html,<script>alert("XSS")</script>); }';
      const result = sanitizer.sanitizeCSS(css, 'testuser');
      expect(result.clean).not.toContain('data:');
      expect(result.removed.length).toBeGreaterThan(0);
    });

    it('should block expression()', () => {
      const css = 'body { width: expression(alert("XSS")); }';
      const result = sanitizer.sanitizeCSS(css, 'testuser');
      expect(result.clean).not.toContain('expression(');
      expect(result.removed.length).toBeGreaterThan(0);
    });

    it('should block behavior:', () => {
      const css = 'body { behavior: url(xss.htc); }';
      const result = sanitizer.sanitizeCSS(css, 'testuser');
      expect(result.clean).not.toContain('behavior:');
      expect(result.removed.length).toBeGreaterThan(0);
    });

    it('should block @import', () => {
      const css = '@import url("evil.css");';
      const result = sanitizer.sanitizeCSS(css, 'testuser');
      expect(result.clean).not.toContain('@import');
      expect(result.removed.length).toBeGreaterThan(0);
    });

    it('should block event handlers', () => {
      const css = 'body { background: url("x") onerror="alert(1)"; }';
      const result = sanitizer.sanitizeCSS(css, 'testuser');
      expect(result.clean).not.toContain('onerror');
      expect(result.removed.length).toBeGreaterThan(0);
    });

    it('should block script tags in CSS', () => {
      const css = 'body { content: "<script>alert(1)</script>"; }';
      const result = sanitizer.sanitizeCSS(css, 'testuser');
      expect(result.clean).not.toContain('<script');
      expect(result.removed.length).toBeGreaterThan(0);
    });
  });

  describe('Property Whitelisting', () => {
    it('should allow safe layout properties', () => {
      const css = 'body { display: flex; width: 100%; margin: 10px; }';
      const result = sanitizer.sanitizeCSS(css, 'testuser');
      expect(result.success).toBe(true);
      expect(result.clean).toContain('display: flex');
      expect(result.clean).toContain('width: 100%');
      expect(result.clean).toContain('margin: 10px');
    });

    it('should allow safe visual properties', () => {
      const css =
        'body { background-color: #000; color: #fff; border: 1px solid red; }';
      const result = sanitizer.sanitizeCSS(css, 'testuser');
      expect(result.success).toBe(true);
      expect(result.clean).toContain('background-color: #000');
      expect(result.clean).toContain('color: #fff');
    });

    it('should allow safe transform properties', () => {
      const css = 'body { transform: rotate(45deg); transition: all 0.3s; }';
      const result = sanitizer.sanitizeCSS(css, 'testuser');
      expect(result.success).toBe(true);
      expect(result.clean).toContain('transform: rotate(45deg)');
      expect(result.clean).toContain('transition: all 0.3s');
    });

    it('should block dangerous properties', () => {
      const css = 'body { -moz-binding: url(xss.xml); }';
      const result = sanitizer.sanitizeCSS(css, 'testuser');
      expect(result.clean).not.toContain('-moz-binding');
      expect(result.removed.length).toBeGreaterThan(0);
    });
  });

  describe('CSS Scoping', () => {
    it('should scope all selectors to username', () => {
      const css = '.profile { color: red; } .header { font-size: 20px; }';
      const result = sanitizer.sanitizeCSS(css, 'johndoe');
      expect(result.clean).toContain(
        '.pixelpage-sandbox[data-username="johndoe"]',
      );
      expect(result.clean).toContain('.profile');
      expect(result.clean).toContain('.header');
    });

    it('should escape username with special characters', () => {
      const css = 'body { color: red; }';
      const result = sanitizer.sanitizeCSS(css, 'user"name');
      expect(result.clean).toContain('user\\"name');
    });

    it('should preserve @keyframes without scoping the name', () => {
      const css = '@keyframes slide { from { left: 0; } to { left: 100%; } }';
      const result = sanitizer.sanitizeCSS(css, 'testuser');
      expect(result.clean).toContain('@keyframes slide');
    });
  });

  describe('URL Validation', () => {
    it('should allow HTTPS URLs', () => {
      const css =
        'body { background-image: url(https://example.com/image.jpg); }';
      const result = sanitizer.sanitizeCSS(css, 'testuser');
      expect(result.success).toBe(true);
      expect(result.clean).toContain('https://example.com/image.jpg');
    });

    it('should allow relative URLs', () => {
      const css = 'body { background-image: url(/images/bg.jpg); }';
      const result = sanitizer.sanitizeCSS(css, 'testuser');
      expect(result.success).toBe(true);
      expect(result.clean).toContain('/images/bg.jpg');
    });

    it('should block vbscript: URLs', () => {
      const css = 'body { background-image: url(vbscript:alert(1)); }';
      const result = sanitizer.sanitizeCSS(css, 'testuser');
      expect(result.clean).not.toContain('vbscript:');
      expect(result.removed.length).toBeGreaterThan(0);
    });
  });

  describe('Size Limits', () => {
    it('should reject CSS exceeding size limit', () => {
      const largeCss = 'body { color: red; }'.repeat(10000);
      const result = sanitizer.sanitizeCSS(largeCss, 'testuser');
      expect(result.success).toBe(false);
      expect(result.removed.some((r) => r.includes('exceeds maximum size'))).toBe(
        true,
      );
    });

    it('should warn about too many rules', () => {
      let css = '';
      for (let i = 0; i < 1100; i++) {
        css += `.class${i} { color: red; }\n`;
      }
      const result = sanitizer.sanitizeCSS(css, 'testuser');
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('Validation', () => {
    it('should validate safe CSS as valid', () => {
      const css = 'body { color: red; font-size: 16px; }';
      const result = sanitizer.validateCSS(css);
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should validate dangerous CSS as invalid', () => {
      const css = 'body { background: url(javascript:alert(1)); }';
      const result = sanitizer.validateCSS(css);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty CSS', () => {
      const result = sanitizer.sanitizeCSS('', 'testuser');
      expect(result.success).toBe(true);
      expect(result.clean).toBe('');
    });

    it('should handle CSS with only comments', () => {
      const css = '/* This is a comment */';
      const result = sanitizer.sanitizeCSS(css, 'testuser');
      expect(result.success).toBe(true);
    });

    it('should handle malformed CSS gracefully', () => {
      const css = 'body { color: red';
      const result = sanitizer.sanitizeCSS(css, 'testuser');
      // Should not crash, even if result is empty
      expect(result).toBeDefined();
    });
  });
});
