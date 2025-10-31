// ============================================
// QuoteFlow - Main Application Logic
// ============================================

class QuoteFlow {
    constructor() {
        this.i18n = new I18nManager();
        this.theme = new ThemeManager();
        this.quotes = [];
        this.currentQuoteIndex = -1;
        this.usedQuotes = new Set();
        
        this.elements = {
            quoteText: document.getElementById('quoteText'),
            quoteAuthor: document.getElementById('quoteAuthor'),
            quoteCategory: document.getElementById('quoteCategory'),
            quoteCounter: document.getElementById('quoteCounter'),
            newQuoteBtn: document.getElementById('newQuoteBtn'),
            copyBtn: document.getElementById('copyBtn'),
            themeToggle: document.getElementById('themeToggle'),
            toast: document.getElementById('toast'),
            toastMessage: document.getElementById('toastMessage'),
            langButtons: document.querySelectorAll('.lang-btn')
        };
        
        this.init();
    }
    
    async init() {
        await this.i18n.init();
        this.theme.init();
        this.quotes = this.i18n.getQuotes();
        this.updateUI();
        this.attachEventListeners();
        this.updateCounter();
        this.updateActiveLanguage();
    }
    
    updateUI() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = this.i18n.t(key);
            if (translation && translation !== key) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = translation;
                } else {
                    el.textContent = translation;
                }
            }
        });
        
        if (this.currentQuoteIndex === -1) {
            this.elements.quoteText.textContent = this.i18n.t('placeholders.initial');
            this.elements.quoteAuthor.textContent = '— QuoteFlow';
        }
    }
    
    updateActiveLanguage() {
        const currentLang = this.i18n.getLanguage();
        this.elements.langButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === currentLang);
        });
    }
    
    attachEventListeners() {
        this.elements.newQuoteBtn.addEventListener('click', () => this.showNewQuote());
        this.elements.copyBtn.addEventListener('click', () => this.copyQuote());
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        this.elements.langButtons.forEach(btn => {
            btn.addEventListener('click', () => this.changeLanguage(btn.dataset.lang));
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && e.target === document.body) {
                e.preventDefault();
                this.showNewQuote();
            }
        });
    }
    
    async changeLanguage(lang) {
        const success = await this.i18n.setLanguage(lang);
        if (success) {
            this.quotes = this.i18n.getQuotes();
            this.usedQuotes.clear();
            this.currentQuoteIndex = -1;
            this.updateUI();
            this.updateActiveLanguage();
            this.updateCounter();
            this.animateLanguageChange();
        }
    }
    
    animateLanguageChange() {
        document.body.style.opacity = '0.7';
        setTimeout(() => {
            document.body.style.opacity = '1';
        }, 200);
    }
    
    showNewQuote() {
        if (this.quotes.length === 0) {
            this.showToast(this.i18n.t('messages.copyError'));
            return;
        }

        if (this.usedQuotes.size === this.quotes.length) {
            this.usedQuotes.clear();
        }
        
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * this.quotes.length);
        } while (this.usedQuotes.has(randomIndex) && this.usedQuotes.size < this.quotes.length);
        
        this.usedQuotes.add(randomIndex);
        this.currentQuoteIndex = randomIndex;
        
        const quote = this.quotes[randomIndex];
        
        this.elements.quoteText.classList.add('fade-out');
        
        setTimeout(() => {
            this.elements.quoteText.textContent = quote.text;
            this.elements.quoteAuthor.textContent = `— ${quote.author}`;
            this.elements.quoteCategory.textContent = quote.category;
            
            this.elements.quoteText.classList.remove('fade-out');
            
            this.updateCounter();
            this.animateButton(this.elements.newQuoteBtn);
        }, 300);
    }
    
    copyQuote() {
        if (this.currentQuoteIndex === -1) {
            this.showToast(this.i18n.t('messages.generateFirst'));
            return;
        }
        
        const quote = this.quotes[this.currentQuoteIndex];
        const textToCopy = `"${quote.text}"\n— ${quote.author}`;
        
        navigator.clipboard.writeText(textToCopy).then(() => {
            this.showToast(this.i18n.t('messages.copied'));
            this.animateButton(this.elements.copyBtn);
        }).catch(() => {
            this.showToast(this.i18n.t('messages.copyError'));
        });
    }
    
    showToast(message) {
        this.elements.toastMessage.textContent = message;
        this.elements.toast.classList.add('show');
        
        setTimeout(() => {
            this.elements.toast.classList.remove('show');
        }, 3000);
    }
    
    animateButton(button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    }
    
    updateCounter() {
        const counterText = this.i18n.t('counter.template', {
            used: this.usedQuotes.size,
            total: this.quotes.length
        });
        this.elements.quoteCounter.textContent = counterText;
    }
    
    toggleTheme() {
        this.theme.toggleTheme();
        this.animateButton(this.elements.themeToggle);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new QuoteFlow();
});
