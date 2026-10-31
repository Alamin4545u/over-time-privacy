/**
 * Nexora Tools — Word & Character Counter Script
 * 100% Client-Side Real-Time Text Analysis
 */

(function () {
  'use strict';

  const textarea = document.getElementById('wordCounterInput');
  const wordCountStat = document.getElementById('statWordCount');
  const charWithSpacesStat = document.getElementById('statCharWithSpaces');
  const charNoSpacesStat = document.getElementById('statCharNoSpaces');
  const sentenceCountStat = document.getElementById('statSentenceCount');
  const paragraphCountStat = document.getElementById('statParagraphCount');
  const readingTimeStat = document.getElementById('statReadingTime');
  const speakingTimeStat = document.getElementById('statSpeakingTime');
  const keywordList = document.getElementById('keywordDensityList');
  const copyBtn = document.getElementById('copyTextBtn');
  const clearBtn = document.getElementById('clearTextBtn');

  if (!textarea) return;

  function analyzeText() {
    const text = textarea.value;

    // Characters
    const charsWithSpaces = text.length;
    const charsNoSpaces = text.replace(/\s/g, '').length;

    // Words
    const wordsArray = text.trim().match(/\b[\w'-]+\b/g) || [];
    const wordCount = wordsArray.length;

    // Sentences
    const sentenceArray = text.trim() ? (text.match(/[.!?]+(?=\s+|$)/g) || []) : [];
    const sentenceCount = sentenceArray.length || (wordCount > 0 ? 1 : 0);

    // Paragraphs
    const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 0);
    const paragraphCount = paragraphs.length;

    // Reading time: standard adult average is 200 wpm
    const readingMinutes = Math.ceil(wordCount / 200);
    const readingSeconds = Math.round((wordCount / 200) * 60);
    let readingDisplay = '< 1 min';
    if (readingSeconds > 60) {
      readingDisplay = `~${readingMinutes} min`;
    } else if (readingSeconds > 0) {
      readingDisplay = `${readingSeconds} sec`;
    }

    // Speaking time: standard speaking rate is 130 wpm
    const speakingMinutes = Math.ceil(wordCount / 130);
    const speakingSeconds = Math.round((wordCount / 130) * 60);
    let speakingDisplay = '< 1 min';
    if (speakingSeconds > 60) {
      speakingDisplay = `~${speakingMinutes} min`;
    } else if (speakingSeconds > 0) {
      speakingDisplay = `${speakingSeconds} sec`;
    }

    // Update UI numbers
    wordCountStat.textContent = wordCount.toLocaleString();
    charWithSpacesStat.textContent = charsWithSpaces.toLocaleString();
    charNoSpacesStat.textContent = charsNoSpaces.toLocaleString();
    sentenceCountStat.textContent = sentenceCount.toLocaleString();
    paragraphCountStat.textContent = paragraphCount.toLocaleString();
    readingTimeStat.textContent = readingDisplay;
    speakingTimeStat.textContent = speakingDisplay;

    // Calculate Top Keyword Density (exclude common stop words)
    updateKeywordDensity(wordsArray, wordCount);
  }

  const STOP_WORDS = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
    'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
    'to', 'was', 'were', 'will', 'with', 'this', 'but', 'they', 'have',
    'had', 'what', 'when', 'where', 'who', 'which', 'why', 'how', 'all',
    'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such',
    'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very'
  ]);

  function updateKeywordDensity(words, totalWords) {
    if (!keywordList) return;

    if (totalWords === 0) {
      keywordList.innerHTML = `<p style="color: var(--text-faint); font-size: 0.88rem;">Type or paste text to inspect frequent keywords.</p>`;
      return;
    }

    const freqMap = {};
    words.forEach(w => {
      const lower = w.toLowerCase();
      if (lower.length > 2 && !STOP_WORDS.has(lower)) {
        freqMap[lower] = (freqMap[lower] || 0) + 1;
      }
    });

    const sorted = Object.entries(freqMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    if (sorted.length === 0) {
      keywordList.innerHTML = `<p style="color: var(--text-faint); font-size: 0.88rem;">No recurring keywords detected yet.</p>`;
      return;
    }

    let html = '<div style="display: flex; flex-wrap: wrap; gap: 0.6rem;">';
    sorted.forEach(([word, count]) => {
      const pct = ((count / totalWords) * 100).toFixed(1);
      html += `
        <span style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-full); padding: 0.35rem 0.85rem; font-size: 0.82rem; display: inline-flex; align-items: center; gap: 0.4rem;">
          <strong>${escapeHtml(word)}</strong>
          <span style="color: var(--accent-cyan); font-weight: 600;">${count} (${pct}%)</span>
        </span>
      `;
    });
    html += '</div>';
    keywordList.innerHTML = html;
  }

  textarea.addEventListener('input', analyzeText);

  copyBtn.addEventListener('click', () => {
    if (!textarea.value.trim()) {
      window.showToast('No text to copy', 'warning');
      return;
    }
    window.copyToClipboard(textarea.value, 'Text copied to clipboard!');
  });

  clearBtn.addEventListener('click', () => {
    textarea.value = '';
    analyzeText();
    textarea.focus();
  });

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Initial call
  analyzeText();
})();
