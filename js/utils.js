/**
 * Utility Functions for VARC Practice App
 * Provides common helper functions and security utilities
 */

const Utils = {
    /**
     * Sanitize HTML content to prevent XSS attacks
     * Escapes HTML special characters while preserving basic formatting
     * @param {string} html - HTML content to sanitize
     * @returns {string} - Sanitized HTML
     */
    sanitizeHTML(html) {
        if (!html || typeof html !== 'string') {
            return '';
        }

        // Create a temporary div element to use browser's HTML parsing
        const temp = document.createElement('div');
        temp.textContent = html;
        return temp.innerHTML;
    },

    /**
     * Safely parse HTML while allowing specific safe tags
     * Used for passages and explanations that need formatting
     * @param {string} html - HTML content
     * @returns {string} - Safely parsed HTML with allowed tags
     */
    parseHTMLSafe(html) {
        if (!html || typeof html !== 'string') {
            return '';
        }

        const temp = document.createElement('div');
        temp.innerHTML = html;

        // Remove all script tags and event handlers
        const scripts = temp.querySelectorAll('script');
        scripts.forEach(script => script.remove());

        // Remove event handler attributes
        const allElements = temp.querySelectorAll('*');
        allElements.forEach(element => {
            // Remove all event handler attributes
            Array.from(element.attributes).forEach(attr => {
                if (attr.name.startsWith('on')) {
                    element.removeAttribute(attr.name);
                }
            });

            // Remove dangerous URL schemes completely
            // Check both element.href and getAttribute('href') for comprehensive protection
            // element.href can be auto-resolved by browser, so check raw attribute too
            if (element.tagName === 'A') {
                const rawHref = element.getAttribute('href');
                const resolvedHref = element.href;
                const dangerousSchemes = ['javascript:', 'data:', 'vbscript:', 'file:', 'about:'];
                
                const isDangerous = (href) => {
                    if (!href) return false;
                    const lowerHref = href.toLowerCase();
                    return dangerousSchemes.some(scheme => lowerHref.startsWith(scheme));
                };
                
                if (isDangerous(rawHref) || isDangerous(resolvedHref)) {
                    // Replace link with span to preserve visible content but remove functionality
                    // Use textContent to avoid reintroducing XSS vulnerabilities
                    const span = document.createElement('span');
                    span.textContent = element.textContent;
                    element.parentNode.replaceChild(span, element);
                }
            }
        });

        return temp.innerHTML;
    },

    /**
     * Validate array index is within bounds
     * @param {Array} array - Array to check
     * @param {number} index - Index to validate
     * @returns {boolean} - True if index is valid
     */
    isValidIndex(array, index) {
        return Array.isArray(array) && 
               typeof index === 'number' && 
               Number.isInteger(index) && 
               index >= 0 && 
               index < array.length;
    },

    /**
     * Safely get array element at index
     * @param {Array} array - Array to access
     * @param {number} index - Index to retrieve
     * @param {*} defaultValue - Default value if index is invalid
     * @returns {*} - Element at index or default value
     */
    safeArrayGet(array, index, defaultValue = null) {
        if (this.isValidIndex(array, index)) {
            return array[index];
        }
        return defaultValue;
    },

    /**
     * Validate integer is within range
     * @param {number} value - Value to check
     * @param {number} min - Minimum allowed value
     * @param {number} max - Maximum allowed value
     * @returns {boolean} - True if value is in range
     */
    isInRange(value, min, max) {
        return typeof value === 'number' && 
               Number.isInteger(value) && 
               value >= min && 
               value <= max;
    },

    /**
     * Safely parse integer from string or number
     * @param {*} value - Value to parse
     * @param {number} defaultValue - Default value if parsing fails
     * @returns {number} - Parsed integer or default value
     */
    safeParseInt(value, defaultValue = 0) {
        if (typeof value === 'number' && Number.isInteger(value)) {
            return value;
        }
        
        const parsed = parseInt(value, 10);
        return isNaN(parsed) ? defaultValue : parsed;
    },

    /**
     * Safely get DOM element by ID with error handling
     * @param {string} id - Element ID
     * @param {boolean} required - Whether element is required (logs error if missing)
     * @returns {HTMLElement|null} - Element or null
     */
    safeGetElement(id, required = false) {
        if (!id || typeof id !== 'string') {
            if (required) {
                console.error(`Invalid element ID: ${id}`);
            }
            return null;
        }

        const element = document.getElementById(id);
        if (!element && required) {
            console.error(`Required element not found: #${id}`);
        }
        return element;
    },

    /**
     * Safely set text content of an element
     * @param {HTMLElement} element - Target element
     * @param {string} text - Text content to set
     * @returns {boolean} - True if successful
     */
    safeSetText(element, text) {
        if (!element) {
            return false;
        }
        element.textContent = text || '';
        return true;
    },

    /**
     * Safely set HTML content of an element
     * @param {HTMLElement} element - Target element
     * @param {string} html - HTML content to set
     * @param {boolean} sanitize - Whether to sanitize HTML (default: true)
     * @returns {boolean} - True if successful
     */
    safeSetHTML(element, html, sanitize = true) {
        if (!element) {
            return false;
        }
        element.innerHTML = sanitize ? this.parseHTMLSafe(html) : html;
        return true;
    },

    /**
     * Safely divide two numbers with zero check
     * @param {number} numerator - Numerator
     * @param {number} denominator - Denominator
     * @param {number} defaultValue - Default value if division by zero
     * @returns {number} - Result or default value
     */
    safeDivide(numerator, denominator, defaultValue = 0) {
        if (typeof numerator !== 'number' || typeof denominator !== 'number') {
            return defaultValue;
        }
        if (denominator === 0) {
            return defaultValue;
        }
        return numerator / denominator;
    },

    /**
     * Format time in seconds to MM:SS format
     * @param {number} seconds - Time in seconds
     * @returns {string} - Formatted time string
     */
    formatTime(seconds) {
        if (typeof seconds !== 'number' || seconds < 0) {
            return '00:00';
        }
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },

    /**
     * Format time in seconds using smart units (s, m, h)
     * @param {number} seconds - Time in seconds
     * @returns {string} - Formatted duration string
     */
    formatDuration(seconds) {
        if (typeof seconds !== 'number' || !Number.isFinite(seconds) || seconds < 0) {
            return '0s';
        }

        const totalSeconds = Math.round(seconds);
        if (totalSeconds < 60) {
            return `${totalSeconds}s`;
        }

        const totalMinutes = Math.floor(totalSeconds / 60);
        const remainingSeconds = totalSeconds % 60;

        if (totalMinutes < 60) {
            return remainingSeconds > 0
                ? `${totalMinutes}m ${remainingSeconds}s`
                : `${totalMinutes}m`;
        }

        const hours = Math.floor(totalMinutes / 60);
        const remainingMinutes = totalMinutes % 60;

        if (remainingMinutes === 0) {
            return `${hours}h`;
        }

        return `${hours}h ${remainingMinutes}m`;
    },

    /**
     * Validate URL parameter is safe integer
     * @param {URLSearchParams} params - URL search params
     * @param {string} key - Parameter key
     * @param {number} defaultValue - Default value if invalid
     * @returns {number} - Validated parameter value
     */
    getValidURLParam(params, key, defaultValue = null) {
        if (!params || !key) {
            return defaultValue;
        }
        
        const value = params.get(key);
        if (value === null) {
            return defaultValue;
        }
        
        const parsed = this.safeParseInt(value, defaultValue);
        return parsed;
    },

    /**
     * Deep clone an object safely
     * @param {*} obj - Object to clone
     * @returns {*} - Cloned object or null if error
     */
    safeClone(obj) {
        try {
            return JSON.parse(JSON.stringify(obj));
        } catch (e) {
            console.error('Error cloning object:', e);
            return null;
        }
    },

    /**
     * Check if value is a valid non-empty string
     * @param {*} value - Value to check
     * @returns {boolean} - True if valid string
     */
    isValidString(value) {
        return typeof value === 'string' && value.trim().length > 0;
    },

    /**
     * Check if value is a valid array with elements
     * @param {*} value - Value to check
     * @returns {boolean} - True if valid non-empty array
     */
    isValidArray(value) {
        return Array.isArray(value) && value.length > 0;
    }
};

// Make Utils available globally for browser
if (typeof window !== 'undefined') {
    window.Utils = Utils;
}

// Export for Node.js/testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}
