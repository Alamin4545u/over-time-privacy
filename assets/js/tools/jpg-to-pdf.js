/**
 * Nexora Tools — JPG to PDF Script
 * 100% Client-Side PDF Generation using jsPDF
 */

(function () {
  'use strict';

  const dropzone = document.getElementById('jpgPdfDropzone');
  const fileInput = document.getElementById('jpgPdfFileInput');
  const workspaceArea = document.getElementById('jpgPdfWorkspace');
  const imagesListContainer = document.getElementById('imagesListContainer');
  const pageSizeSelect = document.getElementById('pdfPageSize');
  const orientationSelect = document.getElementById('pdfOrientation');
  const marginSelect = document.getElementById('pdfMargin');
  const imageCountLabel = document.getElementById('imageCountLabel');
  const generateBtn = document.getElementById('generatePdfBtn');
  const resetBtn = document.getElementById('resetJpgPdfBtn');
  const addMoreBtn = document.getElementById('addMoreImagesBtn');

  let imageFiles = []; // array of { file, dataUrl, width, height }

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
    if (e.dataTransfer.files && e.dataTransfer.files.length) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length) {
      addFiles(Array.from(e.target.files));
    }
  });

  if (addMoreBtn) {
    addMoreBtn.addEventListener('click', () => {
      fileInput.click();
    });
  }

  function addFiles(files) {
    const validImages = files.filter(f => f.type.match(/^image\/(jpeg|png|webp)/i));
    if (validImages.length === 0) {
      window.showToast('Please select valid JPG, PNG, or WebP images.', 'error');
      return;
    }

    let loadedCount = 0;
    validImages.forEach(file => {
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
          imageFiles.push({
            file: file,
            dataUrl: e.target.result,
            width: img.naturalWidth,
            height: img.naturalHeight
          });
          loadedCount++;
          if (loadedCount === validImages.length) {
            renderImagesList();
            dropzone.style.display = 'none';
            workspaceArea.style.display = 'block';
          }
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function renderImagesList() {
    imagesListContainer.innerHTML = '';
    imageCountLabel.textContent = `${imageFiles.length} Image${imageFiles.length !== 1 ? 's' : ''}`;

    if (imageFiles.length === 0) {
      dropzone.style.display = 'block';
      workspaceArea.style.display = 'none';
      return;
    }

    imageFiles.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'result-box';
      card.style.cssText = 'display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-top: 0.75rem; padding: 0.75rem 1rem;';

      card.innerHTML = `
        <div style="display: flex; align-items: center; gap: 1rem; overflow: hidden;">
          <span style="font-weight: 700; color: var(--accent-violet-light); width: 24px;">#${index + 1}</span>
          <img src="${item.dataUrl}" alt="Thumbnail" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px; border: 1px solid var(--border-subtle);">
          <div style="overflow: hidden;">
            <p style="font-weight: 600; font-size: 0.9rem; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">${escapeHtml(item.file.name)}</p>
            <p style="font-size: 0.78rem; color: var(--text-muted);">${item.width} × ${item.height} px • ${window.formatBytes(item.file.size)}</p>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 0.4rem; flex-shrink: 0;">
          <button type="button" class="btn btn-secondary btn-sm move-up-btn" data-index="${index}" title="Move Up" ${index === 0 ? 'disabled' : ''}>▲</button>
          <button type="button" class="btn btn-secondary btn-sm move-down-btn" data-index="${index}" title="Move Down" ${index === imageFiles.length - 1 ? 'disabled' : ''}>▼</button>
          <button type="button" class="btn btn-secondary btn-sm remove-img-btn" data-index="${index}" title="Remove Image" style="color: var(--danger);">✕</button>
        </div>
      `;

      imagesListContainer.appendChild(card);
    });

    // Wire reordering and removal buttons
    imagesListContainer.querySelectorAll('.move-up-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        if (idx > 0) {
          const temp = imageFiles[idx];
          imageFiles[idx] = imageFiles[idx - 1];
          imageFiles[idx - 1] = temp;
          renderImagesList();
        }
      });
    });

    imagesListContainer.querySelectorAll('.move-down-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        if (idx < imageFiles.length - 1) {
          const temp = imageFiles[idx];
          imageFiles[idx] = imageFiles[idx + 1];
          imageFiles[idx + 1] = temp;
          renderImagesList();
        }
      });
    });

    imagesListContainer.querySelectorAll('.remove-img-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        imageFiles.splice(idx, 1);
        renderImagesList();
      });
    });

    generateBtn.disabled = imageFiles.length === 0;
  }

  generateBtn.addEventListener('click', async () => {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      window.showToast('PDF generation library is still loading. Please wait a moment.', 'error');
      return;
    }

    if (imageFiles.length === 0) {
      window.showToast('Please add at least one image.', 'error');
      return;
    }

    generateBtn.disabled = true;
    generateBtn.innerHTML = `<span>Generating PDF...</span>`;

    try {
      const { jsPDF } = window.jspdf;
      const pageSize = pageSizeSelect.value;
      const orientSetting = orientationSelect.value;
      const marginType = marginSelect.value;

      let marginMm = 0;
      if (marginType === 'small') marginMm = 10;
      else if (marginType === 'large') marginMm = 20;

      let doc = null;

      for (let i = 0; i < imageFiles.length; i++) {
        const item = imageFiles[i];
        const isLandscape = item.width > item.height;
        const pageOrient = orientSetting === 'auto' ? (isLandscape ? 'landscape' : 'portrait') : orientSetting;

        if (i === 0) {
          doc = new jsPDF({
            orientation: pageOrient,
            unit: 'mm',
            format: pageSize === 'fit' ? [item.width * 0.264583, item.height * 0.264583] : pageSize
          });
        } else {
          doc.addPage(
            pageSize === 'fit' ? [item.width * 0.264583, item.height * 0.264583] : pageSize,
            pageOrient
          );
        }

        const pageWidthMm = doc.internal.pageSize.getWidth();
        const pageHeightMm = doc.internal.pageSize.getHeight();

        const usableWidth = pageWidthMm - (marginMm * 2);
        const usableHeight = pageHeightMm - (marginMm * 2);

        // Calculate scaling to preserve aspect ratio within usable dimensions
        const imgRatio = item.width / item.height;
        let finalW = usableWidth;
        let finalH = finalW / imgRatio;

        if (finalH > usableHeight) {
          finalH = usableHeight;
          finalW = finalH * imgRatio;
        }

        const posX = marginMm + (usableWidth - finalW) / 2;
        const posY = marginMm + (usableHeight - finalH) / 2;

        doc.addImage(item.dataUrl, 'JPEG', posX, posY, finalW, finalH, undefined, 'FAST');
      }

      doc.save('nexora-converted-images.pdf');
      window.showToast('PDF successfully created and downloaded!', 'success');
    } catch (err) {
      console.error(err);
      window.showToast('Error generating PDF document.', 'error');
    } finally {
      generateBtn.disabled = false;
      generateBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        <span>Convert &amp; Download PDF</span>
      `;
    }
  });

  resetBtn.addEventListener('click', () => {
    imageFiles = [];
    fileInput.value = '';
    renderImagesList();
  });

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();
