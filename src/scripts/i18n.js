// ============================================
// i18n Manager - Internationalization System
// ============================================

class I18nManager {
    constructor() {
        this.currentLang = 'uk';
        this.translations = {};
        this.supportedLanguages = ['uk', 'en', 'ru'];
        this.fallbackLang = 'uk';
    }

    async init() {
        await this.loadSavedLanguage();
        await this.loadTranslations(this.currentLang);
    }

    async loadSavedLanguage() {
        const savedLang = localStorage.getItem('language');
        if (savedLang && this.supportedLanguages.includes(savedLang)) {
            this.currentLang = savedLang;
        } else {
            const browserLang = navigator.language.split('-')[0];
            if (this.supportedLanguages.includes(browserLang)) {
                this.currentLang = browserLang;
            }
        }
        document.documentElement.setAttribute('lang', this.currentLang);
    }

    async loadTranslations(lang) {
        try {
            const response = await fetch(`src/locales/${lang}.json`);
            if (!response.ok) throw new Error(`Failed to load ${lang} translations`);
            this.translations = await response.json();
            return true;
        } catch (error) {
            console.error(`Error loading translations for ${lang}:`, error);
            if (lang !== this.fallbackLang) {
                return await this.loadTranslations(this.fallbackLang);
            }
            return false;
        }
    }

    async setLanguage(lang) {
        if (!this.supportedLanguages.includes(lang)) {
            console.warn(`Language ${lang} is not supported`);
            return false;
        }

        const success = await this.loadTranslations(lang);
        if (success) {
            this.currentLang = lang;
            localStorage.setItem('language', lang);
            document.documentElement.setAttribute('lang', lang);
            return true;
        }
        return false;
    }

    getLanguage() {
        return this.currentLang;
    }

    getSupportedLanguages() {
        return this.supportedLanguages;
    }

    t(key, params = {}) {
        const keys = key.split('.');
        let value = this.translations;

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                console.warn(`Translation key not found: ${key}`);
                return key;
            }
        }

        if (typeof value === 'string') {
            return this.interpolate(value, params);
        }

        return value;
    }

    interpolate(str, params) {
        return str.replace(/\{(\w+)\}/g, (match, key) => {
            return params[key] !== undefined ? params[key] : match;
        });
    }

    getQuotes() {
        return this.translations.quotes || [];
    }

    getRandomQuote() {
        const quotes = this.getQuotes();
        if (quotes.length === 0) return null;
        return quotes[Math.floor(Math.random() * quotes.length)];
    }
}

// Експорт для використання
if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18nManager;
}
