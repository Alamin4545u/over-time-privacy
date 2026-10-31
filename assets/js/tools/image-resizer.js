/**
 * Nexora Tools — Image Resizer Script
 * 100% Client-Side Canvas Resizing
 */

(function () {
  'use strict';

  const dropzone = document.getElementById('resizeDropzone');
  const fileInput = document.getElementById('resizeFileInput');
  const workspaceArea = document.getElementById('resizeWorkspace');
  const imagePreview = document.getElementById('resizeImagePreview');
  const widthInput = document.getElementById('targetWidth');
  const heightInput = document.getElementById('targetHeight');
  const lockAspectCheckbox = document.getElementById('lockAspectRatio');
  const percentButtons = document.querySelectorAll('.percent-btn');
  const originalDimLabel = document.getElementById('originalDimLabel');
  const originalSizeLabel = document.getElementById('originalSizeLabel');
  const currentDimLabel = document.getElementById('currentDimLabel');
  const estimatedSizeLabel = document.getElementById('estimatedSizeLabel');
  const downloadBtn = document.getElementById('downloadResizedBtn');
  const resetBtn = document.getElementById('resetResizeBtn');

  let currentFile = null;
  let currentImage = null;
  let originalWidth = 0;
  let originalHeight = 0;
  let aspectRatio = 1;

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
        originalWidth = currentImage.naturalWidth;
        originalHeight = currentImage.naturalHeight;
        aspectRatio = originalWidth / originalHeight;

        widthInput.value = originalWidth;
        heightInput.value = originalHeight;
        originalDimLabel.textContent = `${originalWidth} × ${originalHeight} px`;
        originalSizeLabel.textContent = window.formatBytes(file.size);
        currentDimLabel.textContent = `${originalWidth} × ${originalHeight} px`;
        estimatedSizeLabel.textContent = window.formatBytes(file.size);

        imagePreview.src = event.target.result;
        dropzone.style.display = 'none';
        workspaceArea.style.display = 'block';
        downloadBtn.disabled = false;
      };
      currentImage.onerror = function () {
        window.showToast('Failed to load image. The file may be damaged.', 'error');
      };
      currentImage.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Width change handler
  widthInput.addEventListener('input', () => {
    let w = parseInt(widthInput.value, 10);
    if (isNaN(w) || w <= 0) return;

    if (lockAspectCheckbox.checked) {
      let h = Math.round(w / aspectRatio);
      heightInput.value = h;
    }
    updateDimensionsDisplay();
  });

  // Height change handler
  heightInput.addEventListener('input', () => {
    let h = parseInt(heightInput.value, 10);
    if (isNaN(h) || h <= 0) return;

    if (lockAspectCheckbox.checked) {
      let w = Math.round(h * aspectRatio);
      widthInput.value = w;
    }
    updateDimensionsDisplay();
  });

  // Percentage preset buttons
  percentButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (!currentImage) return;
      const pct = parseFloat(btn.getAttribute('data-pct')) / 100;
      const newW = Math.round(originalWidth * pct);
      const newH = Math.round(originalHeight * pct);
      widthInput.value = newW;
      heightInput.value = newH;
      updateDimensionsDisplay();
    });
  });

  function updateDimensionsDisplay() {
    const w = parseInt(widthInput.value, 10) || originalWidth;
    const h = parseInt(heightInput.value, 10) || originalHeight;
    currentDimLabel.textContent = `${w} × ${h} px`;
    
    // Rough estimate ratio
    const pixelRatio = (w * h) / (originalWidth * originalHeight);
    estimatedSizeLabel.textContent = '~' + window.formatBytes(Math.round(currentFile.size * Math.min(pixelRatio, 1.5)));
  }

  downloadBtn.addEventListener('click', () => {
    if (!currentImage) return;

    const targetW = parseInt(widthInput.value, 10);
    const targetH = parseInt(heightInput.value, 10);

    if (!targetW || targetW <= 0 || !targetH || targetH <= 0) {
      window.showToast('Please specify valid positive dimensions.', 'error');
      return;
    }

    if (targetW > 10000 || targetH > 10000) {
      window.showToast('Dimensions exceed the maximum browser limit of 10,000px.', 'error');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');

    // Smooth scaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(currentImage, 0, 0, targetW, targetH);

    const mimeType = currentFile.type || 'image/jpeg';
    canvas.toBlob((blob) => {
      if (!blob) {
        window.showToast('Failed to resize image.', 'error');
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const ext = currentFile.name.split('.').pop() || 'jpg';
      const baseName = currentFile.name.substring(0, currentFile.name.lastIndexOf('.')) || 'image';
      link.download = `${baseName}-${targetW}x${targetH}.${ext}`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      window.showToast('Resized image downloaded!', 'success');
    }, mimeType, 0.92);
  });

  resetBtn.addEventListener('click', () => {
    currentFile = null;
    currentImage = null;
    fileInput.value = '';
    dropzone.style.display = 'block';
    workspaceArea.style.display = 'none';
  });
})();
