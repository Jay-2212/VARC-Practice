/**
 * Tests for utility functions
 * These tests validate the security, safety, and correctness of utility helpers
 */

// Fix TextEncoder issue for jsdom - must be before JSDOM import
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;

// Mock DOM for testing
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;

// Load the Utils module
const Utils = require('../../js/utils');

describe('Utils - Security Functions', () => {
    describe('sanitizeHTML', () => {
        test('should escape HTML special characters', () => {
            const input = '<script>alert("XSS")</script>';
            const result = Utils.sanitizeHTML(input);
            expect(result).not.toContain('<script>');
            expect(result).toContain('&lt;script&gt;');
        });

        test('should handle null input', () => {
            expect(Utils.sanitizeHTML(null)).toBe('');
        });

        test('should handle undefined input', () => {
            expect(Utils.sanitizeHTML(undefined)).toBe('');
        });

        test('should handle non-string input', () => {
            expect(Utils.sanitizeHTML(123)).toBe('');
        });

        test('should escape dangerous HTML entities', () => {
            const input = '<img src=x onerror="alert(1)">';
            const result = Utils.sanitizeHTML(input);
            // Should escape the tag, making it safe
            expect(result).toContain('&lt;img');
            expect(result).toContain('&gt;');
            // The escaped version will still contain "onerror" as text, not as executable code
            expect(result).not.toContain('<img');
        });
    });

    describe('parseHTMLSafe', () => {
        test('should allow safe formatting tags', () => {
            const input = '<p>Test <strong>bold</strong> text</p>';
            const result = Utils.parseHTMLSafe(input);
            expect(result).toContain('<p>');
            expect(result).toContain('<strong>');
        });

        test('should remove script tags', () => {
            const input = '<p>Safe</p><script>alert("XSS")</script>';
            const result = Utils.parseHTMLSafe(input);
            expect(result).not.toContain('<script>');
            expect(result).toContain('<p>Safe</p>');
        });

        test('should remove event handlers', () => {
            const input = '<p onclick="alert(1)">Click me</p>';
            const result = Utils.parseHTMLSafe(input);
            expect(result).not.toContain('onclick');
        });

        test('should block javascript: URLs', () => {
            const input = '<a href="javascript:alert(1)">Click</a>';
            const result = Utils.parseHTMLSafe(input);
            expect(result).not.toContain('<a');
            expect(result).toContain('<span>Click</span>');
        });

        test('should block data: URLs', () => {
            const input = '<a href="data:text/html,<script>alert(1)</script>">Click</a>';
            const result = Utils.parseHTMLSafe(input);
            expect(result).not.toContain('<a');
            expect(result).toContain('<span>Click</span>');
        });

        test('should block vbscript: URLs', () => {
            const input = '<a href="vbscript:msgbox(1)">Click</a>';
            const result = Utils.parseHTMLSafe(input);
            expect(result).not.toContain('<a');
            expect(result).toContain('<span>Click</span>');
        });

        test('should block file: URLs', () => {
            const input = '<a href="file:///etc/passwd">Click</a>';
            const result = Utils.parseHTMLSafe(input);
            expect(result).not.toContain('<a');
            expect(result).toContain('<span>Click</span>');
        });

        test('should block about: URLs', () => {
            const input = '<a href="about:blank">Click</a>';
            const result = Utils.parseHTMLSafe(input);
            expect(result).not.toContain('<a');
            expect(result).toContain('<span>Click</span>');
        });

        test('should allow safe http/https URLs', () => {
            const input = '<a href="https://example.com">Safe link</a>';
            const result = Utils.parseHTMLSafe(input);
            expect(result).toContain('<a');
            expect(result).toContain('https://example.com');
        });

        test('should handle null input', () => {
            expect(Utils.parseHTMLSafe(null)).toBe('');
        });
    });
});

describe('Utils - Array Validation', () => {
    describe('isValidIndex', () => {
        test('should return true for valid index', () => {
            const arr = [1, 2, 3];
            expect(Utils.isValidIndex(arr, 0)).toBe(true);
            expect(Utils.isValidIndex(arr, 2)).toBe(true);
        });

        test('should return false for negative index', () => {
            const arr = [1, 2, 3];
            expect(Utils.isValidIndex(arr, -1)).toBe(false);
        });

        test('should return false for out-of-bounds index', () => {
            const arr = [1, 2, 3];
            expect(Utils.isValidIndex(arr, 3)).toBe(false);
            expect(Utils.isValidIndex(arr, 10)).toBe(false);
        });

        test('should return false for non-integer index', () => {
            const arr = [1, 2, 3];
            expect(Utils.isValidIndex(arr, 1.5)).toBe(false);
        });

        test('should return false for non-array', () => {
            expect(Utils.isValidIndex(null, 0)).toBe(false);
            expect(Utils.isValidIndex(undefined, 0)).toBe(false);
            expect(Utils.isValidIndex('string', 0)).toBe(false);
        });
    });

    describe('safeArrayGet', () => {
        test('should return element at valid index', () => {
            const arr = ['a', 'b', 'c'];
            expect(Utils.safeArrayGet(arr, 1)).toBe('b');
        });

        test('should return default value for invalid index', () => {
            const arr = ['a', 'b', 'c'];
            expect(Utils.safeArrayGet(arr, 5, 'default')).toBe('default');
        });

        test('should return null by default for invalid index', () => {
            const arr = ['a', 'b', 'c'];
            expect(Utils.safeArrayGet(arr, -1)).toBeNull();
        });

        test('should handle empty array', () => {
            expect(Utils.safeArrayGet([], 0, 'empty')).toBe('empty');
        });
    });
});

describe('Utils - Number Validation', () => {
    describe('isInRange', () => {
        test('should return true for number in range', () => {
            expect(Utils.isInRange(5, 0, 10)).toBe(true);
            expect(Utils.isInRange(0, 0, 10)).toBe(true);
            expect(Utils.isInRange(10, 0, 10)).toBe(true);
        });

        test('should return false for number out of range', () => {
            expect(Utils.isInRange(-1, 0, 10)).toBe(false);
            expect(Utils.isInRange(11, 0, 10)).toBe(false);
        });

        test('should return false for non-integer', () => {
            expect(Utils.isInRange(5.5, 0, 10)).toBe(false);
        });
    });

    describe('safeParseInt', () => {
        test('should parse valid string numbers', () => {
            expect(Utils.safeParseInt('123')).toBe(123);
            expect(Utils.safeParseInt('-456')).toBe(-456);
        });

        test('should return integer as-is', () => {
            expect(Utils.safeParseInt(789)).toBe(789);
        });

        test('should return default for invalid input', () => {
            expect(Utils.safeParseInt('abc', 0)).toBe(0);
            expect(Utils.safeParseInt(null, -1)).toBe(-1);
        });

        test('should handle edge cases', () => {
            expect(Utils.safeParseInt('123abc')).toBe(123);
            expect(Utils.safeParseInt('')).toBe(0);
        });
    });

    describe('safeDivide', () => {
        test('should divide normally for valid inputs', () => {
            expect(Utils.safeDivide(10, 2)).toBe(5);
            expect(Utils.safeDivide(7, 2)).toBe(3.5);
        });

        test('should return default for division by zero', () => {
            expect(Utils.safeDivide(10, 0, 0)).toBe(0);
            expect(Utils.safeDivide(10, 0, -1)).toBe(-1);
        });

        test('should handle negative numbers', () => {
            expect(Utils.safeDivide(-10, 2)).toBe(-5);
            expect(Utils.safeDivide(10, -2)).toBe(-5);
        });

        test('should return default for non-numbers', () => {
            expect(Utils.safeDivide('10', 2, 0)).toBe(0);
            expect(Utils.safeDivide(10, '2', 0)).toBe(0);
        });
    });
});

describe('Utils - Format Functions', () => {
    describe('formatTime', () => {
        test('should format seconds to MM:SS', () => {
            expect(Utils.formatTime(0)).toBe('00:00');
            expect(Utils.formatTime(59)).toBe('00:59');
            expect(Utils.formatTime(60)).toBe('01:00');
            expect(Utils.formatTime(125)).toBe('02:05');
        });

        test('should handle large numbers', () => {
            expect(Utils.formatTime(3665)).toBe('61:05');
        });

        test('should handle negative numbers', () => {
            expect(Utils.formatTime(-10)).toBe('00:00');
        });

        test('should handle invalid input', () => {
            expect(Utils.formatTime('abc')).toBe('00:00');
            expect(Utils.formatTime(null)).toBe('00:00');
        });
    });

    describe('formatDuration', () => {
        test('should format seconds with smart units', () => {
            expect(Utils.formatDuration(0)).toBe('0s');
            expect(Utils.formatDuration(45)).toBe('45s');
            expect(Utils.formatDuration(60)).toBe('1m');
            expect(Utils.formatDuration(75)).toBe('1m 15s');
            expect(Utils.formatDuration(3600)).toBe('1h');
            expect(Utils.formatDuration(3720)).toBe('1h 2m');
        });

        test('should handle invalid input', () => {
            expect(Utils.formatDuration(-5)).toBe('0s');
            expect(Utils.formatDuration('abc')).toBe('0s');
            expect(Utils.formatDuration(null)).toBe('0s');
        });
    });
});

describe('Utils - Validation Helpers', () => {
    describe('isValidString', () => {
        test('should return true for non-empty strings', () => {
            expect(Utils.isValidString('test')).toBe(true);
            expect(Utils.isValidString('  text  ')).toBe(true);
        });

        test('should return false for empty or whitespace strings', () => {
            expect(Utils.isValidString('')).toBe(false);
            expect(Utils.isValidString('   ')).toBe(false);
        });

        test('should return false for non-strings', () => {
            expect(Utils.isValidString(123)).toBe(false);
            expect(Utils.isValidString(null)).toBe(false);
            expect(Utils.isValidString(undefined)).toBe(false);
        });
    });

    describe('isValidArray', () => {
        test('should return true for non-empty arrays', () => {
            expect(Utils.isValidArray([1, 2, 3])).toBe(true);
            expect(Utils.isValidArray(['a'])).toBe(true);
        });

        test('should return false for empty arrays', () => {
            expect(Utils.isValidArray([])).toBe(false);
        });

        test('should return false for non-arrays', () => {
            expect(Utils.isValidArray('string')).toBe(false);
            expect(Utils.isValidArray(null)).toBe(false);
            expect(Utils.isValidArray(123)).toBe(false);
        });
    });
});
