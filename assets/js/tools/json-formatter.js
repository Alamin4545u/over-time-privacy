/**
 * Nexora Tools - JSON Formatter & Validator
 * 100% Client-Side JSON validation, beautification, minification, tree stats
 */

document.addEventListener('DOMContentLoaded', () => {
  const jsonInput = document.getElementById('json-input');
  const indentSelect = document.getElementById('indent-select');
  const formatBtn = document.getElementById('format-btn');
  const minifyBtn = document.getElementById('minify-btn');
  const clearBtn = document.getElementById('clear-btn');
  const sampleBtn = document.getElementById('sample-btn');
  const copyBtn = document.getElementById('copy-json-btn');
  const downloadBtn = document.getElementById('download-json-btn');
  
  const statusBanner = document.getElementById('status-banner');
  const statusText = document.getElementById('status-text');
  const jsonStats = document.getElementById('json-stats');
  const statsSize = document.getElementById('stats-size');
  const statsKeys = document.getElementById('stats-keys');
  const statsDepth = document.getElementById('stats-depth');

  const sampleJSON = {
    "appName": "Nexora Tools",
    "version": "1.0.0",
    "privacy": {
      "clientSideOnly": true,
      "logsStored": false,
      "acceptedFormats": ["JSON", "JPG", "PNG", "PDF"]
    },
    "features": [
      { "id": 1, "name": "Image Compressor", "active": true },
      { "id": 2, "name": "JSON Formatter", "active": true },
      { "id": 3, "name": "Password Generator", "active": true }
    ],
    "author": "Nexora World Online"
  };

  function getDepth(obj) {
    if (obj === null || typeof obj !== 'object') return 0;
    const depths = Object.values(obj).map(v => getDepth(v));
    return 1 + (depths.length ? Math.max(...depths) : 0);
  }

  function countKeys(obj) {
    if (obj === null || typeof obj !== 'object') return 0;
    let count = 0;
    if (Array.isArray(obj)) {
      count += obj.length;
      for (const item of obj) count += countKeys(item);
    } else {
      const keys = Object.keys(obj);
      count += keys.length;
      for (const key of keys) count += countKeys(obj[key]);
    }
    return count;
  }

  function updateStatus(valid, msg = '', parsedData = null) {
    statusBanner.classList.remove('hidden', 'valid', 'invalid');
    if (valid) {
      statusBanner.classList.add('valid');
      statusText.innerHTML = `<strong>Valid JSON!</strong> Ready to format or download.`;
      
      if (parsedData !== null) {
        jsonStats.classList.remove('hidden');
        const text = jsonInput.value;
        const bytes = new Blob([text]).size;
        statsSize.textContent = `${(bytes / 1024).toFixed(2)} KB (${bytes} bytes)`;
        statsKeys.textContent = countKeys(parsedData);
        statsDepth.textContent = getDepth(parsedData);
      }
    } else {
      statusBanner.classList.add('invalid');
      statusText.innerHTML = `<strong>Invalid JSON Syntax:</strong> ${msg}`;
      jsonStats.classList.add('hidden');
    }
  }

  function formatJSON() {
    const raw = jsonInput.value.trim();
    if (!raw) {
      statusBanner.classList.add('hidden');
      jsonStats.classList.add('hidden');
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      const spaces = parseInt(indentSelect.value, 10);
      const formatted = JSON.stringify(parsed, null, spaces);
      jsonInput.value = formatted;
      updateStatus(true, '', parsed);
    } catch (err) {
      updateStatus(false, err.message);
    }
  }

  function minifyJSON() {
    const raw = jsonInput.value.trim();
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      jsonInput.value = JSON.stringify(parsed);
      updateStatus(true, '', parsed);
      if (window.NexoraApp) window.NexoraApp.showToast('JSON Minified!');
    } catch (err) {
      updateStatus(false, err.message);
    }
  }

  sampleBtn.addEventListener('click', () => {
    jsonInput.value = JSON.stringify(sampleJSON, null, 2);
    formatJSON();
  });

  clearBtn.addEventListener('click', () => {
    jsonInput.value = '';
    statusBanner.classList.add('hidden');
    jsonStats.classList.add('hidden');
  });

  formatBtn.addEventListener('click', formatJSON);
  minifyBtn.addEventListener('click', minifyJSON);
  jsonInput.addEventListener('input', () => {
    const raw = jsonInput.value.trim();
    if (!raw) {
      statusBanner.classList.add('hidden');
      jsonStats.classList.add('hidden');
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      updateStatus(true, '', parsed);
    } catch (err) {
      updateStatus(false, err.message);
    }
  });

  copyBtn.addEventListener('click', () => {
    if (!jsonInput.value.trim()) {
      if (window.NexoraApp) window.NexoraApp.showToast('Nothing to copy!');
      return;
    }
    if (window.NexoraApp) {
      window.NexoraApp.copyToClipboard(jsonInput.value, 'JSON copied to clipboard!');
    }
  });

  downloadBtn.addEventListener('click', () => {
    const content = jsonInput.value;
    if (!content.trim()) {
      if (window.NexoraApp) window.NexoraApp.showToast('Nothing to download!');
      return;
    }
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (window.NexoraApp) window.NexoraApp.showToast('JSON downloaded successfully!');
  });
});
