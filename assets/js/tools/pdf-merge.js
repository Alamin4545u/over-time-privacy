/**
 * Nexora Tools — PDF Merge Script
 * 100% Client-Side PDF Merging using PDF-Lib
 */

(function () {
  'use strict';

  const dropzone = document.getElementById('pdfMergeDropzone');
  const fileInput = document.getElementById('pdfMergeFileInput');
  const workspaceArea = document.getElementById('pdfMergeWorkspace');
  const pdfListContainer = document.getElementById('pdfListContainer');
  const pdfCountLabel = document.getElementById('pdfCountLabel');
  const totalPagesLabel = document.getElementById('totalPagesLabel');
  const mergeBtn = document.getElementById('mergePdfsBtn');
  const resetBtn = document.getElementById('resetPdfMergeBtn');
  const addMoreBtn = document.getElementById('addMorePdfBtn');

  let pdfItems = []; // array of { file, arrayBuffer, pageCount, title }

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

  async function addFiles(files) {
    const validPdfs = files.filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    if (validPdfs.length === 0) {
      window.showToast('Please select valid PDF documents.', 'error');
      return;
    }

    if (!window.PDFLib) {
      window.showToast('PDF parsing library is loading. Please try again in a few seconds.', 'error');
      return;
    }

    for (const file of validPdfs) {
      try {
        const buffer = await file.arrayBuffer();
        const pdfDoc = await window.PDFLib.PDFDocument.load(buffer, { ignoreEncryption: true });
        const count = pdfDoc.getPageCount();

        pdfItems.push({
          file: file,
          arrayBuffer: buffer,
          pageCount: count,
          name: file.name,
          size: file.size
        });
      } catch (err) {
        console.error('Failed to parse PDF', err);
        window.showToast(`Could not load ${file.name}. It may be password-protected or damaged.`, 'error');
      }
    }

    renderPdfList();
    if (pdfItems.length > 0) {
      dropzone.style.display = 'none';
      workspaceArea.style.display = 'block';
    }
  }

  function renderPdfList() {
    pdfListContainer.innerHTML = '';
    const totalPages = pdfItems.reduce((acc, curr) => acc + curr.pageCount, 0);

    pdfCountLabel.textContent = `${pdfItems.length} File${pdfItems.length !== 1 ? 's' : ''}`;
    totalPagesLabel.textContent = `${totalPages} Total Page${totalPages !== 1 ? 's' : ''}`;

    if (pdfItems.length === 0) {
      dropzone.style.display = 'block';
      workspaceArea.style.display = 'none';
      return;
    }

    pdfItems.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'result-box';
      card.style.cssText = 'display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-top: 0.75rem; padding: 0.85rem 1.25rem;';

      card.innerHTML = `
        <div style="display: flex; align-items: center; gap: 1rem; overflow: hidden;">
          <span style="font-weight: 700; color: var(--accent-cyan); width: 24px;">#${index + 1}</span>
          <div style="width: 36px; height: 36px; border-radius: 6px; background: rgba(239, 68, 68, 0.15); display: flex; align-items: center; justify-content: center; color: #ef4444; flex-shrink: 0;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
          </div>
          <div style="overflow: hidden;">
            <p style="font-weight: 600; font-size: 0.92rem; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">${escapeHtml(item.name)}</p>
            <p style="font-size: 0.8rem; color: var(--text-muted);">${item.pageCount} Pages • ${window.formatBytes(item.size)}</p>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 0.4rem; flex-shrink: 0;">
          <button type="button" class="btn btn-secondary btn-sm move-up-btn" data-index="${index}" title="Move Up" ${index === 0 ? 'disabled' : ''}>▲</button>
          <button type="button" class="btn btn-secondary btn-sm move-down-btn" data-index="${index}" title="Move Down" ${index === pdfItems.length - 1 ? 'disabled' : ''}>▼</button>
          <button type="button" class="btn btn-secondary btn-sm remove-pdf-btn" data-index="${index}" title="Remove Document" style="color: var(--danger);">✕</button>
        </div>
      `;

      pdfListContainer.appendChild(card);
    });

    // Wire buttons
    pdfListContainer.querySelectorAll('.move-up-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        if (idx > 0) {
          const temp = pdfItems[idx];
          pdfItems[idx] = pdfItems[idx - 1];
          pdfItems[idx - 1] = temp;
          renderPdfList();
        }
      });
    });

    pdfListContainer.querySelectorAll('.move-down-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        if (idx < pdfItems.length - 1) {
          const temp = pdfItems[idx];
          pdfItems[idx] = pdfItems[idx + 1];
          pdfItems[idx + 1] = temp;
          renderPdfList();
        }
      });
    });

    pdfListContainer.querySelectorAll('.remove-pdf-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        pdfItems.splice(idx, 1);
        renderPdfList();
      });
    });

    mergeBtn.disabled = pdfItems.length < 2;
  }

  mergeBtn.addEventListener('click', async () => {
    if (!window.PDFLib) {
      window.showToast('PDF-Lib engine not ready. Please try again.', 'error');
      return;
    }

    if (pdfItems.length < 2) {
      window.showToast('Please upload at least 2 PDF files to merge.', 'warning');
      return;
    }

    mergeBtn.disabled = true;
    mergeBtn.innerHTML = `<span>Merging documents in browser...</span>`;

    try {
      const mergedPdf = await window.PDFLib.PDFDocument.create();

      for (const item of pdfItems) {
        const donorPdf = await window.PDFLib.PDFDocument.load(item.arrayBuffer, { ignoreEncryption: true });
        const copiedPages = await mergedPdf.copyPages(donorPdf, donorPdf.getPageIndices());
        copiedPages.forEach(page => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = 'nexora-merged-document.pdf';
      link.click();
      URL.revokeObjectURL(url);

      window.showToast('Merged PDF successfully downloaded!', 'success');
    } catch (err) {
      console.error('Merge failure', err);
      window.showToast('Failed to merge PDFs. Verify that none are encrypted.', 'error');
    } finally {
      mergeBtn.disabled = false;
      mergeBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        <span>Merge &amp; Download Combined PDF</span>
      `;
    }
  });

  resetBtn.addEventListener('click', () => {
    pdfItems = [];
    fileInput.value = '';
    renderPdfList();
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
