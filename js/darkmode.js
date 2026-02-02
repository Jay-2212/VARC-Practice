/**
 * Dark Mode Manager
 * Handles dark mode state, persistence, and UI updates across all pages
 */

class DarkModeManager {
    constructor() {
        this.STORAGE_KEY = 'varc_dark_mode';
        this.darkMode = this.loadDarkModePreference();
        this.initializeDarkMode();
    }

    /**
     * Load dark mode preference from localStorage
     * @returns {boolean} True if dark mode is enabled, false otherwise
     */
    loadDarkModePreference() {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        return saved === 'true'; // Default is false (light mode)
    }

    /**
     * Save dark mode preference to localStorage
     * @param {boolean} enabled - Whether dark mode is enabled
     */
    saveDarkModePreference(enabled) {
        localStorage.setItem(this.STORAGE_KEY, enabled.toString());
    }

    /**
     * Initialize dark mode on page load
     */
    initializeDarkMode() {
        if (this.darkMode) {
            document.body.classList.add('dark-mode');
        }
    }

    /**
     * Toggle dark mode on/off
     * @returns {boolean} New dark mode state
     */
    toggle() {
        this.darkMode = !this.darkMode;
        this.saveDarkModePreference(this.darkMode);
        
        if (this.darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        
        return this.darkMode;
    }

    /**
     * Check if dark mode is currently enabled
     * @returns {boolean} True if dark mode is enabled
     */
    isEnabled() {
        return this.darkMode;
    }

    /**
     * Create and insert a dark mode toggle button
     * @param {HTMLElement} container - Parent element to insert toggle button
     * @param {string} position - Position in container ('prepend' or 'append')
     */
    createToggleButton(container, position = 'append') {
        const toggleButton = document.createElement('button');
        toggleButton.className = 'dark-mode-toggle';
        toggleButton.setAttribute('aria-label', 'Toggle dark mode');
        toggleButton.innerHTML = `
            <i class="fas fa-moon"></i>
            <i class="fas fa-sun"></i>
        `;
        
        // Update button state
        this.updateToggleButton(toggleButton);
        
        // Add click handler
        toggleButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggle();
            this.updateToggleButton(toggleButton);
        });
        
        // Insert into container
        if (position === 'prepend') {
            container.insertBefore(toggleButton, container.firstChild);
        } else {
            container.appendChild(toggleButton);
        }
        
        return toggleButton;
    }

    /**
     * Update toggle button appearance based on current mode
     * @param {HTMLElement} button - The toggle button element
     */
    updateToggleButton(button) {
        const moonIcon = button.querySelector('.fa-moon');
        const sunIcon = button.querySelector('.fa-sun');
        
        if (this.darkMode) {
            moonIcon.style.display = 'none';
            sunIcon.style.display = 'block';
        } else {
            moonIcon.style.display = 'block';
            sunIcon.style.display = 'none';
        }
    }
}

// Create a global instance
const darkModeManager = new DarkModeManager();
