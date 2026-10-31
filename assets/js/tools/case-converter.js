/**
 * Nexora Tools — Case Converter Script
 * 100% Client-Side Text Transformation
 */

(function () {
  'use strict';

  const textarea = document.getElementById('caseConverterInput');
  const countStats = document.getElementById('caseTextStats');
  const copyBtn = document.getElementById('copyCaseBtn');
  const clearBtn = document.getElementById('clearCaseBtn');
  const downloadBtn = document.getElementById('downloadCaseBtn');
  const caseButtons = document.querySelectorAll('.case-transform-btn');

  if (!textarea) return;

  function updateStats() {
    const text = textarea.value;
    const words = (text.trim().match(/\b[\w'-]+\b/g) || []).length;
    const chars = text.length;
    if (countStats) {
      countStats.textContent = `${words} Words • ${chars} Characters`;
    }
  }

  textarea.addEventListener('input', updateStats);

  caseButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-case');
      const current = textarea.value;
      if (!current) {
        window.showToast('Please enter text first.', 'warning');
        return;
      }

      let transformed = current;
      switch (mode) {
        case 'upper':
          transformed = current.toUpperCase();
          break;
        case 'lower':
          transformed = current.toLowerCase();
          break;
        case 'sentence':
          transformed = toSentenceCase(current);
          break;
        case 'title':
          transformed = toTitleCase(current);
          break;
        case 'capitalized':
          transformed = toCapitalizedCase(current);
          break;
        case 'camel':
          transformed = toCamelCase(current);
          break;
        case 'snake':
          transformed = toSnakeCase(current);
          break;
        case 'kebab':
          transformed = toKebabCase(current);
          break;
        case 'alternating':
          transformed = toAlternatingCase(current);
          break;
      }

      textarea.value = transformed;
      updateStats();
      window.showToast(`Converted to ${btn.textContent.trim()}!`, 'success');
    });
  });

  function toSentenceCase(str) {
    return str.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase());
  }

  function toTitleCase(str) {
    const minorWords = new Set(['and', 'as', 'but', 'for', 'if', 'nor', 'or', 'so', 'yet', 'a', 'an', 'the', 'at', 'by', 'for', 'in', 'of', 'off', 'on', 'per', 'to', 'up', 'via']);
    return str.toLowerCase().split(' ').map((word, index) => {
      if (index === 0 || !minorWords.has(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    }).join(' ');
  }

  function toCapitalizedCase(str) {
    return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }

  function toCamelCase(str) {
    return str
      .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
      .replace(/^[A-Z]/, c => c.toLowerCase());
  }

  function toSnakeCase(str) {
    return str
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[\s\W-]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .toLowerCase();
  }

  function toKebabCase(str) {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s\W_]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();
  }

  function toAlternatingCase(str) {
    let result = '';
    let upper = false;
    for (const char of str) {
      if (/[a-zA-Z]/.test(char)) {
        result += upper ? char.toUpperCase() : char.toLowerCase();
        upper = !upper;
      } else {
        result += char;
      }
    }
    return result;
  }

  copyBtn.addEventListener('click', () => {
    if (!textarea.value.trim()) {
      window.showToast('No text to copy.', 'warning');
      return;
    }
    window.copyToClipboard(textarea.value, 'Converted text copied!');
  });

  clearBtn.addEventListener('click', () => {
    textarea.value = '';
    updateStats();
    textarea.focus();
  });

  downloadBtn.addEventListener('click', () => {
    const text = textarea.value;
    if (!text.trim()) {
      window.showToast('No text to download.', 'warning');
      return;
    }
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'nexora-converted-text.txt';
    link.click();
    URL.revokeObjectURL(url);
    window.showToast('Text file downloaded!', 'success');
  });

  updateStats();
})();
