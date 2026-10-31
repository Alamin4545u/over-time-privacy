/**
 * Nexora Tools — Image Compressor Script
 * 100% Client-Side Compression using HTML5 Canvas API
 */

(function () {
  'use strict';

  const dropzone = document.getElementById('compressDropzone');
  const fileInput = document.getElementById('compressFileInput');
  const workspaceArea = document.getElementById('compressWorkspace');
  const originalPreview = document.getElementById('originalPreview');
  const compressedPreview = document.getElementById('compressedPreview');
  const qualitySlider = document.getElementById('qualitySlider');
  const qualityValueLabel = document.getElementById('qualityValue');
  const originalSizeLabel = document.getElementById('originalSize');
  const compressedSizeLabel = document.getElementById('compressedSize');
  const savingsBadge = document.getElementById('savingsBadge');
  const downloadBtn = document.getElementById('downloadCompressedBtn');
  const resetBtn = document.getElementById('resetCompressBtn');

  let currentFile = null;
  let currentImage = null;
  let compressedBlob = null;
  let compressedUrl = null;

  if (!dropzone || !fileInput) return;

  // Drag and drop event handlers
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
        originalPreview.src = event.target.result;
        originalSizeLabel.textContent = window.formatBytes(file.size);
        dropzone.style.display = 'none';
        workspaceArea.style.display = 'block';
        compressImage();
      };
      currentImage.onerror = function () {
        window.showToast('Failed to load image. The file may be damaged.', 'error');
      };
      currentImage.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  function compressImage() {
    if (!currentImage) return;

    const quality = parseFloat(qualitySlider.value) / 100;
    qualityValueLabel.textContent = qualitySlider.value + '%';

    const canvas = document.createElement('canvas');
    canvas.width = currentImage.naturalWidth;
    canvas.height = currentImage.naturalHeight;
    const ctx = canvas.getContext('2d');
    
    // Draw on canvas
    ctx.drawImage(currentImage, 0, 0);

    // Determine output MIME type (JPEG/WebP support quality parameter)
    let outputType = currentFile.type;
    if (outputType === 'image/png') {
      // For PNGs with quality slider, export as WebP to achieve real lossy compression if desired
      outputType = 'image/webp';
    }

    canvas.toBlob((blob) => {
      if (!blob) {
        window.showToast('Error during compression', 'error');
        return;
      }

      compressedBlob = blob;
      if (compressedUrl) {
        URL.revokeObjectURL(compressedUrl);
      }
      compressedUrl = URL.createObjectURL(blob);
      compressedPreview.src = compressedUrl;

      // Update size & savings indicators
      compressedSizeLabel.textContent = window.formatBytes(blob.size);
      
      const savedBytes = currentFile.size - blob.size;
      const savedPercent = Math.round((savedBytes / currentFile.size) * 100);
      
      if (savedBytes > 0) {
        savingsBadge.textContent = `${savedPercent}% Smaller`;
        savingsBadge.style.color = '#10b981';
      } else {
        savingsBadge.textContent = `Original Optimal`;
        savingsBadge.style.color = 'var(--text-muted)';
      }

      downloadBtn.disabled = false;
    }, outputType, quality);
  }

  qualitySlider.addEventListener('input', () => {
    qualityValueLabel.textContent = qualitySlider.value + '%';
  });

  qualitySlider.addEventListener('change', () => {
    compressImage();
  });

  downloadBtn.addEventListener('click', () => {
    if (!compressedBlob) return;
    const link = document.createElement('a');
    const ext = currentFile.type === 'image/png' ? 'webp' : currentFile.name.split('.').pop();
    const baseName = currentFile.name.substring(0, currentFile.name.lastIndexOf('.')) || 'image';
    link.download = `${baseName}-compressed.${ext}`;
    link.href = compressedUrl;
    link.click();
    window.showToast('Compressed image downloaded!', 'success');
  });

  resetBtn.addEventListener('click', () => {
    currentFile = null;
    currentImage = null;
    compressedBlob = null;
    if (compressedUrl) {
      URL.revokeObjectURL(compressedUrl);
      compressedUrl = null;
    }
    fileInput.value = '';
    dropzone.style.display = 'block';
    workspaceArea.style.display = 'none';
  });
})();
