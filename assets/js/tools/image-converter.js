/**
 * Nexora Tools — Image Format Converter Script
 * Convert between PNG, JPG, and WebP 100% in-browser
 */

(function () {
  'use strict';

  const dropzone = document.getElementById('converterDropzone');
  const fileInput = document.getElementById('converterFileInput');
  const workspaceArea = document.getElementById('converterWorkspace');
  const imagePreview = document.getElementById('converterImagePreview');
  const targetFormatSelect = document.getElementById('targetFormatSelect');
  const formatInfoNote = document.getElementById('formatInfoNote');
  const qualityContainer = document.getElementById('converterQualityContainer');
  const qualitySlider = document.getElementById('converterQualitySlider');
  const qualityValLabel = document.getElementById('converterQualityVal');
  const originalFormatBadge = document.getElementById('originalFormatBadge');
  const originalFileSizeLabel = document.getElementById('converterOrigSize');
  const convertedFileSizeLabel = document.getElementById('converterNewSize');
  const downloadBtn = document.getElementById('downloadConvertedBtn');
  const resetBtn = document.getElementById('resetConverterBtn');

  let currentFile = null;
  let currentImage = null;
  let convertedBlob = null;
  let convertedUrl = null;

  const FORMAT_DESCS = {
    'image/webp': 'WebP provides superior lossy and lossless compression for web graphics, reducing file sizes by up to 30% compared to JPG/PNG while maintaining visual clarity.',
    'image/jpeg': 'JPEG/JPG is the universal standard for photography and realistic visuals, delivering excellent compression with wide compatibility across all devices and software.',
    'image/png': 'PNG offers lossless compression with support for crisp alpha transparency, making it ideal for logos, digital illustrations, and screenshots.'
  };

  if (!dropzone || !fileInput) return;

  ['dragenter', 'dragover'].forEach(name => {
    dropzone.addEventListener(name, (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(name => {
    dropzone.addEventListener(name, (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
    });
  });

  dropzone.addEventListener('drop', (e) => {
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  });

  function handleFile(file) {
    if (!file.type.match(/^image\/(jpeg|png|webp)/i)) {
      window.showToast('Please upload a valid JPG, PNG, or WebP image.', 'error');
      return;
    }

    currentFile = file;
    const reader = new FileReader();
    reader.onload = function (event) {
      currentImage = new Image();
      currentImage.onload = function () {
        originalFormatBadge.textContent = file.type.split('/')[1].toUpperCase();
        originalFileSizeLabel.textContent = window.formatBytes(file.size);
        imagePreview.src = event.target.result;

        // Auto-select a sensible target different from current
        if (file.type === 'image/png') {
          targetFormatSelect.value = 'image/webp';
        } else if (file.type === 'image/jpeg') {
          targetFormatSelect.value = 'image/webp';
        } else {
          targetFormatSelect.value = 'image/png';
        }

        updateFormatView();
        dropzone.style.display = 'none';
        workspaceArea.style.display = 'block';
        convertImage();
      };
      currentImage.onerror = function () {
        window.showToast('Failed to load image. The file may be damaged.', 'error');
      };
      currentImage.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  function updateFormatView() {
    const format = targetFormatSelect.value;
    formatInfoNote.textContent = FORMAT_DESCS[format] || '';

    if (format === 'image/png') {
      qualityContainer.style.display = 'none';
    } else {
      qualityContainer.style.display = 'block';
    }
  }

  function convertImage() {
    if (!currentImage) return;

    const targetMime = targetFormatSelect.value;
    const quality = parseFloat(qualitySlider.value) / 100;
    qualityValLabel.textContent = qualitySlider.value + '%';

    const canvas = document.createElement('canvas');
    canvas.width = currentImage.naturalWidth;
    canvas.height = currentImage.naturalHeight;
    const ctx = canvas.getContext('2d');

    // If converting to JPEG, fill canvas with white background so transparent pixels don't turn black
    if (targetMime === 'image/jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.drawImage(currentImage, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) {
        window.showToast('Error during image conversion', 'error');
        return;
      }

      convertedBlob = blob;
      if (convertedUrl) {
        URL.revokeObjectURL(convertedUrl);
      }
      convertedUrl = URL.createObjectURL(blob);
      convertedFileSizeLabel.textContent = window.formatBytes(blob.size);
      downloadBtn.disabled = false;
    }, targetMime, quality);
  }

  targetFormatSelect.addEventListener('change', () => {
    updateFormatView();
    convertImage();
  });

  qualitySlider.addEventListener('input', () => {
    qualityValLabel.textContent = qualitySlider.value + '%';
  });

  qualitySlider.addEventListener('change', () => {
    convertImage();
  });

  downloadBtn.addEventListener('click', () => {
    if (!convertedBlob) return;
    const link = document.createElement('a');
    const mime = targetFormatSelect.value;
    let ext = 'webp';
    if (mime === 'image/png') ext = 'png';
    else if (mime === 'image/jpeg') ext = 'jpg';

    const baseName = currentFile.name.substring(0, currentFile.name.lastIndexOf('.')) || 'converted';
    link.download = `${baseName}.${ext}`;
    link.href = convertedUrl;
    link.click();
    window.showToast(`Converted to .${ext.toUpperCase()} and downloaded!`, 'success');
  });

  resetBtn.addEventListener('click', () => {
    currentFile = null;
    currentImage = null;
    convertedBlob = null;
    if (convertedUrl) {
      URL.revokeObjectURL(convertedUrl);
      convertedUrl = null;
    }
    fileInput.value = '';
    dropzone.style.display = 'block';
    workspaceArea.style.display = 'none';
  });
})();
