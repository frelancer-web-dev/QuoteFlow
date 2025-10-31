// ============================================
// Theme Manager - Theme Switching System
// ============================================

class ThemeManager {
    constructor() {
        this.currentTheme = 'dark';
        this.storageKey = 'quoteflow_theme';
    }

    init() {
        this.loadTheme();
    }

    loadTheme() {
        const savedTheme = localStorage.getItem(this.storageKey);
        if (savedTheme) {
            this.currentTheme = savedTheme;
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.currentTheme = prefersDark ? 'dark' : 'light';
        }
        this.applyTheme(this.currentTheme);
    }

    applyTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        localStorage.setItem(this.storageKey, theme);
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    }

    getTheme() {
        return this.currentTheme;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}
