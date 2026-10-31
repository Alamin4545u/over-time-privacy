/**
 * Nexora Tools - Cryptographic Password Generator
 * 100% Client-Side using window.crypto.getRandomValues
 */

document.addEventListener('DOMContentLoaded', () => {
  const passwordOutput = document.getElementById('password-output');
  const copyBtn = document.getElementById('copy-password-btn');
  const refreshBtn = document.getElementById('refresh-password-btn');
  const lengthSlider = document.getElementById('length-slider');
  const lengthVal = document.getElementById('length-val');

  // Option toggles
  const optUpper = document.getElementById('opt-upper');
  const optLower = document.getElementById('opt-lower');
  const optNumbers = document.getElementById('opt-numbers');
  const optSymbols = document.getElementById('opt-symbols');
  const optExcludeAmbiguous = document.getElementById('opt-ambiguous');

  // Strength UI
  const strengthBar = document.getElementById('strength-bar');
  const strengthLabel = document.getElementById('strength-label');
  const entropyLabel = document.getElementById('entropy-label');

  // Bulk Generator
  const bulkCountInput = document.getElementById('bulk-count');
  const bulkGenBtn = document.getElementById('bulk-gen-btn');
  const bulkResults = document.getElementById('bulk-results');
  const bulkOutput = document.getElementById('bulk-output');
  const copyBulkBtn = document.getElementById('copy-bulk-btn');

  const CHARS = {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
  };

  const AMBIGUOUS = /[O0lI1]/g;

  function generateSinglePassword(length, options) {
    let charset = '';
    let required = [];

    if (options.upper) {
      let set = CHARS.upper;
      if (options.excludeAmbiguous) set = set.replace(AMBIGUOUS, '');
      charset += set;
      required.push(getRandomChar(set));
    }
    if (options.lower) {
      let set = CHARS.lower;
      if (options.excludeAmbiguous) set = set.replace(AMBIGUOUS, '');
      charset += set;
      required.push(getRandomChar(set));
    }
    if (options.numbers) {
      let set = CHARS.numbers;
      if (options.excludeAmbiguous) set = set.replace(AMBIGUOUS, '');
      charset += set;
      required.push(getRandomChar(set));
    }
    if (options.symbols) {
      let set = CHARS.symbols;
      charset += set;
      required.push(getRandomChar(set));
    }

    if (!charset) {
      charset = CHARS.lower;
    }

    const remainingLength = Math.max(0, length - required.length);
    const randomArray = new Uint32Array(remainingLength);
    window.crypto.getRandomValues(randomArray);

    let passwordChars = [...required];
    for (let i = 0; i < remainingLength; i++) {
      passwordChars.push(charset[randomArray[i] % charset.length]);
    }

    // Shuffle characters using Fisher-Yates with crypto
    const shuffleArray = new Uint32Array(passwordChars.length);
    window.crypto.getRandomValues(shuffleArray);
    for (let i = passwordChars.length - 1; i > 0; i--) {
      const j = shuffleArray[i] % (i + 1);
      [passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
    }

    return {
      password: passwordChars.join(''),
      charsetSize: charset.length
    };
  }

  function getRandomChar(str) {
    const arr = new Uint32Array(1);
    window.crypto.getRandomValues(arr);
    return str[arr[0] % str.length];
  }

  function calculateStrength(password, charsetSize) {
    if (!password) return { label: 'Empty', color: '#EF4444', pct: 0, entropy: 0 };
    
    // Entropy = length * log2(charsetSize)
    const entropy = Math.round(password.length * (Math.log2(Math.max(charsetSize, 2))));

    let label = 'Very Weak';
    let color = '#EF4444';
    let pct = 20;

    if (entropy >= 80) {
      label = 'Very Strong';
      color = '#10B981';
      pct = 100;
    } else if (entropy >= 60) {
      label = 'Strong';
      color = '#06B6D4';
      pct = 80;
    } else if (entropy >= 45) {
      label = 'Moderate';
      color = '#F59E0B';
      pct = 60;
    } else if (entropy >= 30) {
      label = 'Weak';
      color = '#F97316';
      pct = 40;
    }

    return { label, color, pct, entropy };
  }

  function updatePassword() {
    const length = parseInt(lengthSlider.value, 10);
    lengthVal.textContent = length;

    // Ensure at least one is checked
    if (!optUpper.checked && !optLower.checked && !optNumbers.checked && !optSymbols.checked) {
      optLower.checked = true;
    }

    const options = {
      upper: optUpper.checked,
      lower: optLower.checked,
      numbers: optNumbers.checked,
      symbols: optSymbols.checked,
      excludeAmbiguous: optExcludeAmbiguous.checked
    };

    const res = generateSinglePassword(length, options);
    passwordOutput.value = res.password;

    const strength = calculateStrength(res.password, res.charsetSize);
    strengthBar.style.width = `${strength.pct}%`;
    strengthBar.style.backgroundColor = strength.color;
    strengthLabel.textContent = strength.label;
    strengthLabel.style.color = strength.color;
    entropyLabel.textContent = `${strength.entropy} bits of entropy`;
  }

  lengthSlider.addEventListener('input', updatePassword);
  optUpper.addEventListener('change', updatePassword);
  optLower.addEventListener('change', updatePassword);
  optNumbers.addEventListener('change', updatePassword);
  optSymbols.addEventListener('change', updatePassword);
  optExcludeAmbiguous.addEventListener('change', updatePassword);
  refreshBtn.addEventListener('click', updatePassword);

  copyBtn.addEventListener('click', () => {
    if (!passwordOutput.value) return;
    if (window.NexoraApp) {
      window.NexoraApp.copyToClipboard(passwordOutput.value, 'Password copied to clipboard!');
    }
  });

  // Bulk Generator
  bulkGenBtn.addEventListener('click', () => {
    const count = Math.min(Math.max(parseInt(bulkCountInput.value, 10) || 5, 1), 50);
    const length = parseInt(lengthSlider.value, 10);
    const options = {
      upper: optUpper.checked,
      lower: optLower.checked,
      numbers: optNumbers.checked,
      symbols: optSymbols.checked,
      excludeAmbiguous: optExcludeAmbiguous.checked
    };

    const list = [];
    for (let i = 0; i < count; i++) {
      list.push(generateSinglePassword(length, options).password);
    }

    bulkOutput.value = list.join('\n');
    bulkResults.classList.remove('hidden');
    if (window.NexoraApp) window.NexoraApp.showToast(`Generated ${count} passwords!`);
  });

  copyBulkBtn.addEventListener('click', () => {
    if (!bulkOutput.value) return;
    if (window.NexoraApp) {
      window.NexoraApp.copyToClipboard(bulkOutput.value, 'All bulk passwords copied!');
    }
  });

  // Initialize
  updatePassword();
});
