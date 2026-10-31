/**
 * Nexora Tools — Core Application Script
 * Fast, free and private online tools running 100% client-side.
 * Domain: nexoraworldonline.online
 */

(function () {
  'use strict';

  // 1. Theme Management (Dark / Light mode)
  const THEME_KEY = 'nexora_theme';

  function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme, false);

    const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
    toggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(nextTheme, true);
      });
    });
  }

  function setTheme(theme, save = true) {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    if (save) {
      localStorage.setItem(THEME_KEY, theme);
    }
    updateThemeIcon(theme);
  }

  function updateThemeIcon(theme) {
    const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
    toggleBtns.forEach(btn => {
      if (theme === 'light') {
        // Moon icon for switching to dark
        btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
        btn.setAttribute('aria-label', 'Switch to dark theme');
      } else {
        // Sun icon for switching to light
        btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
        btn.setAttribute('aria-label', 'Switch to light theme');
      }
    });
  }

  // 2. Mobile Navigation Drawer
  function initMobileMenu() {
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const mobileDrawer = document.querySelector('.mobile-drawer');

    if (mobileBtn && mobileDrawer) {
      mobileBtn.addEventListener('click', () => {
        const isOpen = mobileDrawer.classList.toggle('open');
        mobileBtn.setAttribute('aria-expanded', String(isOpen));
      });
    }
  }

  // 3. Search & Live Category Filtering (Tools Grid)
  function initToolFilters() {
    const searchInput = document.querySelector('#toolSearchInput');
    const chipBtns = document.querySelectorAll('.category-chips .chip-btn');
    const toolCards = document.querySelectorAll('.tools-grid .tool-card');
    const noResultsMsg = document.querySelector('#noToolsFound');

    if (!toolCards.length) return;

    let currentCategory = 'all';
    let searchQuery = '';

    function filterTools() {
      let visibleCount = 0;
      const normalizedQuery = searchQuery.trim().toLowerCase();

      toolCards.forEach(card => {
        const title = (card.querySelector('.tool-card-title')?.textContent || '').toLowerCase();
        const desc = (card.querySelector('.tool-card-desc')?.textContent || '').toLowerCase();
        const category = (card.getAttribute('data-category') || '').toLowerCase();

        const matchesCategory = currentCategory === 'all' || category === currentCategory.toLowerCase();
        const matchesQuery = !normalizedQuery || title.includes(normalizedQuery) || desc.includes(normalizedQuery);

        if (matchesCategory && matchesQuery) {
          card.style.display = 'flex';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      if (noResultsMsg) {
        noResultsMsg.style.display = visibleCount === 0 ? 'block' : 'none';
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        filterTools();
      });
    }

    chipBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        chipBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.getAttribute('data-filter') || 'all';
        filterTools();
      });
    });
  }

  // 4. FAQ Accordion
  function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
      const trigger = item.querySelector('.faq-trigger');
      const content = item.querySelector('.faq-content');

      if (trigger && content) {
        trigger.addEventListener('click', () => {
          const isOpen = item.classList.contains('open');

          // Close all in this accordion
          faqItems.forEach(otherItem => {
            otherItem.classList.remove('open');
            const otherContent = otherItem.querySelector('.faq-content');
            if (otherContent) otherContent.style.maxHeight = null;
          });

          // Toggle current
          if (!isOpen) {
            item.classList.add('open');
            content.style.maxHeight = content.scrollHeight + 'px';
            trigger.setAttribute('aria-expanded', 'true');
          } else {
            trigger.setAttribute('aria-expanded', 'false');
          }
        });
      }
    });
  }

  // 5. Global Toast Notification System
  window.showToast = function (message, type = 'success', duration = 3000) {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');

    const iconSvg = type === 'success'
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;

    toast.innerHTML = `${iconSvg}<span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, duration);
  };

  // 6. Global Clipboard Copy Helper
  window.copyToClipboard = function (text, successMessage = 'Copied to clipboard!') {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        window.showToast(successMessage, 'success');
      }).catch(() => {
        fallbackCopy(text, successMessage);
      });
    } else {
      fallbackCopy(text, successMessage);
    }
  };

  function fallbackCopy(text, successMessage) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      window.showToast(successMessage, 'success');
    } catch (err) {
      window.showToast('Failed to copy', 'error');
    }
    document.body.removeChild(textArea);
  }

  // 7. Utility: Format Bytes
  window.formatBytes = function (bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Document Ready Initialization
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initMobileMenu();
    initToolFilters();
    initFaqAccordion();
  });
})();
