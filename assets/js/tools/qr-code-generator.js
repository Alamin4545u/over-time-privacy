/**
 * Nexora Tools — QR Code Generator Script
 * 100% Client-Side QR Code generation using qrcodejs
 */

(function () {
  'use strict';

  const textInput = document.getElementById('qrTextInput');
  const fgColorInput = document.getElementById('qrFgColor');
  const bgColorInput = document.getElementById('qrBgColor');
  const sizeSelect = document.getElementById('qrSizeSelect');
  const errorLevelSelect = document.getElementById('qrErrorCorrection');
  const qrCanvasContainer = document.getElementById('qrCanvasContainer');
  const downloadPngBtn = document.getElementById('downloadQrBtn');
  const copyQrBtn = document.getElementById('copyQrBtn');
  const presetPills = document.querySelectorAll('.qr-preset-pill');

  let qrCodeInstance = null;

  if (!textInput || !qrCanvasContainer) return;

  function generateQRCode() {
    const rawText = textInput.value.trim();
    if (!rawText) {
      qrCanvasContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--text-faint); text-align: center; padding: 2rem;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          <p style="margin-top: 0.75rem; font-size: 0.9rem;">Enter text or a URL above to render your QR code.</p>
        </div>
      `;
      downloadPngBtn.disabled = true;
      copyQrBtn.disabled = true;
      return;
    }

    if (!window.QRCode) {
      window.showToast('QR code engine is loading. Please wait...', 'warning');
      return;
    }

    qrCanvasContainer.innerHTML = '';
    const size = parseInt(sizeSelect.value, 10) || 256;
    const fgColor = fgColorInput.value || '#000000';
    const bgColor = bgColorInput.value || '#ffffff';

    // Map error correction
    let correctLevel = window.QRCode.CorrectLevel.M;
    const ec = errorLevelSelect.value;
    if (ec === 'L') correctLevel = window.QRCode.CorrectLevel.L;
    else if (ec === 'Q') correctLevel = window.QRCode.CorrectLevel.Q;
    else if (ec === 'H') correctLevel = window.QRCode.CorrectLevel.H;

    qrCodeInstance = new window.QRCode(qrCanvasContainer, {
      text: rawText,
      width: size,
      height: size,
      colorDark: fgColor,
      colorLight: bgColor,
      correctLevel: correctLevel
    });

    // Enable download buttons once rendered
    setTimeout(() => {
      downloadPngBtn.disabled = false;
      copyQrBtn.disabled = false;
    }, 150);
  }

  // Live input change listeners
  textInput.addEventListener('input', generateQRCode);
  fgColorInput.addEventListener('input', generateQRCode);
  bgColorInput.addEventListener('input', generateQRCode);
  sizeSelect.addEventListener('change', generateQRCode);
  errorLevelSelect.addEventListener('change', generateQRCode);

  // Presets
  presetPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const type = pill.getAttribute('data-type');
      if (type === 'url') {
        textInput.value = 'https://nexoraworldonline.online';
      } else if (type === 'wifi') {
        textInput.value = 'WIFI:S:MyHomeNetwork;T:WPA;P:SecretPassword123;;';
      } else if (type === 'email') {
        textInput.value = 'mailto:contact@nexoraworldonline.online?subject=Inquiry';
      } else if (type === 'vcard') {
        textInput.value = 'BEGIN:VCARD\nVERSION:3.0\nN:Smith;John\nFN:John Smith\nTEL;TYPE=CELL:+1234567890\nEMAIL:john@example.com\nEND:VCARD';
      }
      generateQRCode();
    });
  });

  // Download high-res PNG
  downloadPngBtn.addEventListener('click', () => {
    const canvas = qrCanvasContainer.querySelector('canvas');
    const img = qrCanvasContainer.querySelector('img');

    if (canvas) {
      const link = document.createElement('a');
      link.download = 'nexora-qrcode.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      window.showToast('QR Code downloaded as PNG!', 'success');
    } else if (img && img.src) {
      const link = document.createElement('a');
      link.download = 'nexora-qrcode.png';
      link.href = img.src;
      link.click();
      window.showToast('QR Code downloaded as PNG!', 'success');
    }
  });

  // Copy to clipboard
  copyQrBtn.addEventListener('click', async () => {
    const canvas = qrCanvasContainer.querySelector('canvas');
    if (!canvas) {
      window.showToast('Unable to copy QR image.', 'error');
      return;
    }

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        window.showToast('QR Code copied to clipboard!', 'success');
      } catch (err) {
        window.showToast('Direct image clipboard copying not supported on this browser.', 'warning');
      }
    });
  });

  // Initial trigger if default text present
  generateQRCode();
})();
