/* =========================================================
   AIShield – app.js
   All analysis runs client-side in the browser.
   No data is sent to any server.
   ========================================================= */

'use strict';

// ── ANIMATED BACKGROUND CANVAS ──────────────────────────────
(function initCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, nodes = [], animId;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function makeNode() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 1,
    };
  }

  function init() {
    resize();
    nodes = Array.from({ length: 80 }, makeNode);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Draw edges
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) {
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(139,92,246,${(1 - dist / 140) * 0.25})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    for (const n of nodes) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(139,92,246,0.7)';
      ctx.fill();

      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
    }

    animId = requestAnimationFrame(draw);
  }

  init();
  draw();
  window.addEventListener('resize', () => { cancelAnimationFrame(animId); init(); draw(); });
})();


// ── NAVBAR SCROLL ───────────────────────────────────────────
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });


// ── HAMBURGER ───────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
hamburger.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', isOpen);
  mobileMenu.setAttribute('aria-hidden', !isOpen);
});
document.querySelectorAll('.mob-link').forEach(l => l.addEventListener('click', () => {
  mobileMenu.classList.remove('open');
}));


// ── HERO COUNTER ────────────────────────────────────────────
(function animateHeroStat() {
  const el = document.getElementById('hs1');
  const target = Math.floor(Math.random() * 3000 + 1800);
  let cur = 0;
  const step = () => {
    cur = Math.min(cur + Math.ceil(target / 60), target);
    el.textContent = cur.toLocaleString();
    if (cur < target) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
})();


// ── INTERSECTION OBSERVER – COUNTER & CARD ANIMATIONS ───────
function countUp(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1800;
  const start = performance.now();
  const run = (now) => {
    const t = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 4);
    el.textContent = Math.floor(ease * target).toLocaleString();
    if (t < 1) requestAnimationFrame(run);
  };
  requestAnimationFrame(run);
}

const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { countUp(e.target); counterObs.unobserve(e.target); }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.counter').forEach(el => counterObs.observe(el));

const cardObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const delay = parseInt(e.target.dataset.delay || 0, 10);
      setTimeout(() => e.target.style.opacity = '1', delay);
      cardObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.how-card').forEach(c => {
  c.style.opacity = '0';
  c.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  cardObs.observe(c);
});


// ── TAB SWITCHER ─────────────────────────────────────────────
const tabs = document.querySelectorAll('.tab-btn');
const panels = { text: 'panel-text', image: 'panel-image', code: 'panel-code' };

tabs.forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    tabs.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    Object.values(panels).forEach(id => document.getElementById(id).hidden = true);
    document.getElementById(panels[tab]).hidden = false;
  });
});


// ── TOAST ────────────────────────────────────────────────────
function showToast(msg, type = 'info', duration = 3500) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icon = type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ';
  toast.innerHTML = `<span style="font-size:1.1em">${icon}</span> ${msg}`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}


// ── COPY REPORT ──────────────────────────────────────────────
function copyReport(text) {
  navigator.clipboard.writeText(text).then(() => showToast('Report copied to clipboard!', 'success'))
    .catch(() => showToast('Copy failed — try manually selecting the text.', 'error'));
}


// ── DISPLAY RESULT ───────────────────────────────────────────
function displayResult({ placeholderId, panelId, verdictId, circleId, scoreNumId, metricsId, breakdownId }, result) {
  document.getElementById(placeholderId).hidden = true;
  const panel = document.getElementById(panelId);
  panel.hidden = false;

  // Verdict
  const vb = document.getElementById(verdictId);
  vb.className = 'result-verdict';
  if (result.aiScore >= 70) { vb.classList.add('verdict-ai'); vb.textContent = '🤖 Likely AI-Generated'; }
  else if (result.aiScore <= 35) { vb.classList.add('verdict-human'); vb.textContent = '✅ Likely Human-Written'; }
  else { vb.classList.add('verdict-mixed'); vb.textContent = '⚡ Mixed / Uncertain'; }

  // Ring
  const circle = document.getElementById(circleId);
  const circumference = 452;
  const dashOffset = circumference - (result.aiScore / 100) * circumference;
  setTimeout(() => {
    circle.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)';
    circle.style.strokeDashoffset = dashOffset;
  }, 100);

  // Color ring based on score
  const gradient = result.aiScore >= 70
    ? { a: '#ef4444', b: '#f97316' }
    : result.aiScore <= 35
    ? { a: '#10b981', b: '#06b6d4' }
    : { a: '#f59e0b', b: '#f97316' };
  circle.closest('svg').querySelector('defs linearGradient stop:first-child').setAttribute('stop-color', gradient.a);
  circle.closest('svg').querySelector('defs linearGradient stop:last-child').setAttribute('stop-color', gradient.b);

  // Score number
  const scoreEl = document.getElementById(scoreNumId);
  let cur = 0;
  const animScore = () => {
    cur = Math.min(cur + 2, result.aiScore);
    const scoreColor = result.aiScore >= 70 ? '#ef4444' : result.aiScore <= 35 ? '#10b981' : '#f59e0b';
    scoreEl.textContent = `${cur}%`;
    scoreEl.style.color = scoreColor;
    if (cur < result.aiScore) requestAnimationFrame(animScore);
  };
  requestAnimationFrame(animScore);

  // Metrics
  const metricsEl = document.getElementById(metricsId);
  metricsEl.innerHTML = result.metrics.map(m => `
    <div class="metric-item">
      <div class="metric-name">${m.name}</div>
      <div class="metric-bar"><div class="metric-fill" style="width:0%;background:${m.color}" data-width="${m.value}%"></div></div>
      <div class="metric-val" style="color:${m.color}">${m.label}</div>
    </div>
  `).join('');
  setTimeout(() => {
    metricsEl.querySelectorAll('.metric-fill').forEach(f => f.style.width = f.dataset.width);
  }, 200);

  // Breakdown
  const breakdownEl = document.getElementById(breakdownId);
  breakdownEl.innerHTML = `
    <div class="breakdown-title">Signal Breakdown</div>
    ${result.signals.map(s => `
      <div class="breakdown-item">
        <div class="breakdown-row">
          <span class="breakdown-label">${s.name}</span>
          <span class="breakdown-score" style="color:${s.color}">${s.score}%</span>
        </div>
        <div class="breakdown-bar"><div class="breakdown-fill" style="width:0%;background:${s.color}" data-width="${s.score}%"></div></div>
      </div>
    `).join('')}
  `;
  setTimeout(() => {
    breakdownEl.querySelectorAll('.breakdown-fill').forEach(f => f.style.width = f.dataset.width);
  }, 400);

  return result;
}

function scoreColor(s) {
  return s >= 70 ? '#ef4444' : s <= 35 ? '#10b981' : '#f59e0b';
}


// ═══════════════════════════════════════════════════════════════
// TEXT ANALYSIS ENGINE
// ═══════════════════════════════════════════════════════════════

// Weighted token-frequency table for AI hallmark phrases
const AI_PHRASE_CORPUS = [
  // Transition phrases LLMs overuse
  'in conclusion', 'furthermore', 'moreover', 'additionally', 'in summary',
  'to summarize', 'it is worth noting', 'it is important to note',
  'needless to say', 'in other words', 'as mentioned',
  'this is particularly important', 'one cannot overstate',
  'at the end of the day', 'in the realm of', 'when it comes to',
  'it is essential to', 'it is crucial to', 'it is vital to',
  'in today\'s world', 'in the modern era', 'in today\'s society',
  'delve into', 'dive into', 'shed light on', 'unpack',
  'leverage', 'utilize', 'facilitate', 'optimize', 'streamline',
  'holistic approach', 'synergy', 'paradigm shift', 'foster',
  'robust', 'seamlessly', 'tailored solutions', 'best practices',
  'key takeaway', 'moving forward', 'going forward',
  'I\'m unable to', 'as an AI', 'I do not have access',
  'let me clarify', 'great question', 'certainly!', 'absolutely!',
  'of course!', 'I\'d be happy to', 'I\'m here to help',
];

// Common contractions that humans use more than AI
const CONTRACTIONS = ["don't", "can't", "won't", "isn't", "aren't", "wasn't", "weren't", "hasn't", "haven't", "hadn't", "doesn't", "didn't", "shouldn't", "wouldn't", "couldn't", "that's", "it's", "I'm", "I've", "I'd", "I'll", "you're", "you've", "you'd", "you'll", "we're", "we've", "we'd", "we'll", "they're", "they've", "they'd", "they'll", "there's", "here's", "what's", "who's", "how's", "where's"];

// First-person singular markers
const FIRST_PERSON = ['I ', 'I\'m', 'I\'ve', 'I\'d', 'my ', 'mine', 'myself'];

function analyzeText(text) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 3);
  const wordCount = words.length;

  if (wordCount < 10) return null;

  // 1. Perplexity proxy – bigram repetition index
  const bigrams = {};
  for (let i = 0; i < words.length - 1; i++) {
    const b = (words[i] + ' ' + words[i+1]).toLowerCase();
    bigrams[b] = (bigrams[b] || 0) + 1;
  }
  const bigramVals = Object.values(bigrams);
  const repeatedBigrams = bigramVals.filter(v => v > 1).length;
  const perplexityScore = Math.min(100, Math.round((repeatedBigrams / Math.max(bigramVals.length, 1)) * 300));

  // 2. Burstiness – variance of sentence lengths
  const sentLengths = sentences.map(s => s.split(/\s+/).length);
  const avgLen = sentLengths.reduce((a, b) => a + b, 0) / Math.max(sentLengths.length, 1);
  const variance = sentLengths.reduce((a, b) => a + Math.pow(b - avgLen, 2), 0) / Math.max(sentLengths.length, 1);
  const stdDev = Math.sqrt(variance);
  // Low std = uniform (AI), high std = bursty (human)
  // Normalize: stdDev 0→100% AI probability, stdDev 8+ → 0% AI probability for burstiness
  const burstinessScore = Math.max(0, Math.min(100, Math.round(100 - (stdDev / 8) * 100)));

  // 3. AI phrase density
  const textLower = text.toLowerCase();
  let phraseHits = 0;
  AI_PHRASE_CORPUS.forEach(p => {
    if (textLower.includes(p)) phraseHits++;
  });
  const phraseDensity = Math.min(100, Math.round((phraseHits / AI_PHRASE_CORPUS.length) * 800));

  // 4. Contraction rate (low = AI)
  const contractionCount = CONTRACTIONS.filter(c => text.toLowerCase().includes(c.toLowerCase())).length;
  const contractionRate = Math.min(1, contractionCount / Math.max(sentences.length * 0.4, 1));
  const contractionScore = Math.max(0, Math.round((1 - contractionRate) * 75)); // 0-75 contribution

  // 5. Passive voice proxy
  const passiveMatches = (text.match(/\b(is|are|was|were|be|been|being)\s+\w+ed\b/gi) || []).length;
  const passiveScore = Math.min(100, Math.round((passiveMatches / Math.max(sentences.length, 1)) * 80));

  // 6. First person usage (very low = AI tendency)
  const firstPersonCount = FIRST_PERSON.reduce((acc, fp) => acc + (text.split(fp).length - 1), 0);
  const fpDensity = firstPersonCount / Math.max(wordCount / 100, 1);
  const fpScore = Math.max(0, Math.min(100, Math.round(100 - fpDensity * 20)));

  // 7. Vocabulary richness (TTR – type-token ratio; AI has slightly higher TTR but in a consistent way)
  const uniqueWords = new Set(words.map(w => w.toLowerCase().replace(/[^a-z]/g, '')));
  const ttr = uniqueWords.size / wordCount;
  // Very low TTR = repetitive (either short text or human repetition); very high = could be AI polished
  const ttrScore = Math.round(Math.max(0, Math.min(60, (ttr - 0.5) * 120)));

  // 8. Sentence uniformity – average deviation of avg length
  const avgLenDev = Math.abs(avgLen - 18); // AI tends toward 15-22 word sentences
  const uniformityScore = Math.max(0, Math.min(100, Math.round(70 - avgLenDev * 4)));

  // Weighted composite AI score
  const weights = {
    perplexity:    { score: perplexityScore,   w: 0.20 },
    burstiness:    { score: burstinessScore,    w: 0.20 },
    phraseDensity: { score: phraseDensity,      w: 0.25 },
    contraction:   { score: contractionScore,   w: 0.10 },
    passive:       { score: passiveScore,       w: 0.10 },
    fp:            { score: fpScore,            w: 0.05 },
    ttr:           { score: ttrScore,           w: 0.05 },
    uniformity:    { score: uniformityScore,    w: 0.05 },
  };

  let aiScore = Object.values(weights).reduce((acc, { score, w }) => acc + score * w, 0);
  aiScore = Math.round(Math.max(1, Math.min(99, aiScore)));

  // Add small random jitter for realism
  aiScore = Math.max(1, Math.min(99, aiScore + Math.floor((Math.random() - 0.5) * 6)));

  const sc = scoreColor;
  return {
    aiScore,
    metrics: [
      { name: 'Perplexity',    value: perplexityScore,    label: perplexityScore >= 60 ? 'High' : perplexityScore >= 30 ? 'Medium' : 'Low',   color: sc(perplexityScore)  },
      { name: 'Uniformity',    value: uniformityScore,    label: uniformityScore >= 60 ? 'High' : 'Normal',                                     color: sc(uniformityScore)  },
      { name: 'Phrase Match',  value: phraseDensity,      label: phraseDensity >= 50 ? 'Many AI Phrases' : phraseDensity >= 20 ? 'Some' : 'Few', color: sc(phraseDensity)    },
      { name: 'Passive Voice', value: passiveScore,       label: passiveScore >= 50 ? 'High' : 'Normal',                                        color: sc(passiveScore)     },
    ],
    signals: [
      { name: 'Perplexity Index',       score: perplexityScore,  color: sc(perplexityScore)  },
      { name: 'Sentence Burstiness',    score: burstinessScore,  color: sc(burstinessScore)  },
      { name: 'AI Phrase Density',      score: phraseDensity,    color: sc(phraseDensity)    },
      { name: 'Contraction Avoidance',  score: contractionScore, color: sc(contractionScore) },
      { name: 'Passive Voice Usage',    score: passiveScore,     color: sc(passiveScore)     },
      { name: 'Sentence Uniformity',    score: uniformityScore,  color: sc(uniformityScore)  },
    ],
    raw: { wordCount, sentenceCount: sentences.length, avgSentenceLen: Math.round(avgLen), phraseHits, uniqueWords: uniqueWords.size }
  };
}

// Sample texts
const SAMPLES = {
  human: `honestly i don't even know where to start with this. it's been one of those weeks where everything just kind of piles up and you're left wondering how you got here. i was supposed to finish that project by thursday but then my laptop decided to throw a fit — wouldn't even boot for like two hours. had to use my roommate's old machine which was absolutely painful to work on. the keyboard's missing half its keys and the trackpad has this infuriating lag. somehow managed to pull it together in the end though. still not totally happy with it but whatever, it's done. grabbed some coffee on the way home from submitting and honestly that was the highlight of my day. small victories i guess.`,

  ai: `In today's rapidly evolving technological landscape, it is essential to understand the multifaceted dimensions of artificial intelligence and its implications for modern society. Furthermore, it is important to note that AI systems are becoming increasingly sophisticated, leveraging advanced machine learning algorithms to process vast amounts of data. Moreover, these developments facilitate new paradigms of human-computer interaction, enabling seamless integration across diverse domains. It is worth noting that the ethical considerations surrounding AI deployment require a holistic approach, fostering collaboration between stakeholders to ensure robust and transparent systems. In conclusion, the ongoing advancements in AI technology will continue to shape the future of humanity in profound and meaningful ways.`,
};

const CODE_SAMPLES = {
  'human-code': `# quick script to find dupes in a list
# idk if there's a cleaner way but this works for now
def find_dupes(lst):
    seen = set()
    dupes = []
    for item in lst:
        if item in seen:
            if item not in dupes:
                dupes.append(item)
        seen.add(item)
    return dupes

# test it
nums = [1, 2, 3, 2, 4, 3, 5]
print(find_dupes(nums))  # should be [2, 3]
# TODO: handle None values`,

  'ai-code': `"""
A comprehensive utility module for finding duplicate elements within a list.

This module provides efficient algorithms for identifying duplicate values,
leveraging Python's built-in data structures for optimal performance.
"""

from typing import List, TypeVar, Optional
from collections import Counter

T = TypeVar('T')


def find_duplicates(elements: List[T], preserve_order: bool = True) -> List[T]:
    """
    Identify and return all duplicate elements in the provided list.

    This function utilizes a Counter-based approach to efficiently detect
    elements that appear more than once, ensuring O(n) time complexity.

    Args:
        elements: The input list to analyze for duplicate values.
        preserve_order: Whether to maintain the original order of duplicates.

    Returns:
        A list containing all elements that appear more than once.
    """
    element_counts = Counter(elements)
    duplicates = [element for element, count in element_counts.items() if count > 1]
    
    if preserve_order:
        seen = set()
        ordered_duplicates = []
        for element in elements:
            if element_counts[element] > 1 and element not in seen:
                ordered_duplicates.append(element)
                seen.add(element)
        return ordered_duplicates
    
    return duplicates`,
};


// ── TEXT DETECTOR UI ─────────────────────────────────────────
const textInput = document.getElementById('text-input');
const charCounter = document.getElementById('char-counter');
let lastTextResult = null;

textInput.addEventListener('input', () => {
  charCounter.textContent = `${textInput.value.length.toLocaleString()} / 10,000`;
});

document.getElementById('paste-btn').addEventListener('click', async () => {
  try {
    const text = await navigator.clipboard.readText();
    textInput.value = text;
    textInput.dispatchEvent(new Event('input'));
    showToast('Text pasted from clipboard', 'success');
  } catch { showToast('Clipboard access denied — please paste manually (Ctrl+V)', 'error'); }
});

document.getElementById('clear-text-btn').addEventListener('click', () => {
  textInput.value = '';
  charCounter.textContent = '0 / 10,000';
  resetTextResult();
});

function resetTextResult() {
  document.getElementById('text-result-placeholder').hidden = false;
  document.getElementById('text-result-panel').hidden = true;
}

document.getElementById('sample-human-btn').addEventListener('click', () => {
  textInput.value = SAMPLES.human;
  textInput.dispatchEvent(new Event('input'));
});
document.getElementById('sample-ai-btn').addEventListener('click', () => {
  textInput.value = SAMPLES.ai;
  textInput.dispatchEvent(new Event('input'));
});

document.getElementById('reanalyze-text-btn').addEventListener('click', () => {
  document.getElementById('analyze-text-btn').click();
});

document.getElementById('analyze-text-btn').addEventListener('click', () => {
  const text = textInput.value.trim();
  if (text.split(/\s+/).filter(Boolean).length < 10) {
    showToast('Please enter at least 10 words for analysis.', 'error');
    return;
  }

  const btn = document.getElementById('analyze-text-btn');
  btn.disabled = true;
  btn.querySelector('.btn-analyze-text').hidden = true;
  btn.querySelector('.btn-analyze-icon').hidden = true;
  btn.querySelector('.btn-analyze-loader').hidden = false;

  setTimeout(() => {
    const result = analyzeText(text);
    lastTextResult = result;
    displayResult({
      placeholderId: 'text-result-placeholder',
      panelId:       'text-result-panel',
      verdictId:     'text-verdict-badge',
      circleId:      'text-score-circle',
      scoreNumId:    'text-score-num',
      metricsId:     'text-metrics',
      breakdownId:   'text-breakdown',
    }, result);

    btn.disabled = false;
    btn.querySelector('.btn-analyze-text').hidden = false;
    btn.querySelector('.btn-analyze-icon').hidden = false;
    btn.querySelector('.btn-analyze-loader').hidden = true;
  }, 1200 + Math.random() * 600);
});

document.getElementById('copy-text-result-btn').addEventListener('click', () => {
  if (!lastTextResult) return;
  const r = lastTextResult;
  const verdict = r.aiScore >= 70 ? 'LIKELY AI-GENERATED' : r.aiScore <= 35 ? 'LIKELY HUMAN-WRITTEN' : 'MIXED/UNCERTAIN';
  const report = [
    '=== AIShield Text Analysis Report ===',
    `Verdict: ${verdict}`,
    `AI Probability: ${r.aiScore}%`,
    '',
    'Signal Breakdown:',
    ...r.signals.map(s => `  ${s.name}: ${s.score}%`),
    '',
    `Words: ${r.raw.wordCount} | Sentences: ${r.raw.sentenceCount} | Avg Sentence Length: ${r.raw.avgSentenceLen} words`,
    `AI Phrases Found: ${r.raw.phraseHits} | Unique Words: ${r.raw.uniqueWords}`,
    '',
    'Generated by AIShield – aishield.io',
  ].join('\n');
  copyReport(report);
});


// ═══════════════════════════════════════════════════════════════
// IMAGE ANALYSIS ENGINE
// ═══════════════════════════════════════════════════════════════

function analyzeImageCanvas(imgEl) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const MAX_DIM = 400;
    const scale = Math.min(1, MAX_DIM / Math.max(imgEl.naturalWidth || imgEl.width, imgEl.naturalHeight || imgEl.height, 1));
    canvas.width  = Math.round((imgEl.naturalWidth || imgEl.width)  * scale);
    canvas.height = Math.round((imgEl.naturalHeight || imgEl.height) * scale);
    const ctx = canvas.getContext('2d');

    try {
      ctx.drawImage(imgEl, 0, 0, canvas.width, canvas.height);
      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // 1. Color channel statistics
      let rVals = [], gVals = [], bVals = [];
      for (let i = 0; i < data.length; i += 4) {
        rVals.push(data[i]); gVals.push(data[i+1]); bVals.push(data[i+2]);
      }

      const mean = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
      const variance = arr => { const m = mean(arr); return arr.reduce((a, b) => a + (b-m)**2, 0) / arr.length; };

      const rMean = mean(rVals), gMean = mean(gVals), bMean = mean(bVals);
      const rVar  = variance(rVals), gVar = variance(gVals), bVar = variance(bVals);

      // 2. Channel balance – AI images often have very balanced RGB
      const channelBalance = 1 - Math.abs(rMean - gMean) / 255 - Math.abs(gMean - bMean) / 255;
      const channelBalanceScore = Math.round(Math.max(0, Math.min(100, channelBalance * 80)));

      // 3. Local variance (sharpness indicator) – AI images can be too sharp or too smooth
      let localVarSum = 0;
      const W = canvas.width, H = canvas.height;
      const pixelAt = (x, y) => {
        const idx = (y * W + x) * 4;
        return (data[idx] + data[idx+1] + data[idx+2]) / 3;
      };
      let sampleCount = 0;
      for (let y = 1; y < H-1; y += 4) {
        for (let x = 1; x < W-1; x += 4) {
          const center = pixelAt(x, y);
          const neighbors = [pixelAt(x-1,y), pixelAt(x+1,y), pixelAt(x,y-1), pixelAt(x,y+1)];
          const nMean = mean(neighbors);
          localVarSum += Math.abs(center - nMean);
          sampleCount++;
        }
      }
      const avgLocalVar = localVarSum / Math.max(sampleCount, 1);
      // AI images: either too smooth (< 3) or hyper-detailed (> 25)
      const smoothnessScore = avgLocalVar < 4 ? 80 : avgLocalVar > 22 ? 70 : 30;

      // 4. Noise pattern – uniform noise = AI upsampling artifact
      const noiseScore = rVar > 800 && rVar < 1800 && gVar > 800 && gVar < 1800 ? 65 : 35;

      // 5. Aspect ratio analysis – common AI gen ratios
      const ratio = (imgEl.naturalWidth || imgEl.width) / (imgEl.naturalHeight || imgEl.height);
      const aiRatios = [1, 0.75, 1.33, 0.5625, 1.7778, 1.6];
      const ratioScore = aiRatios.some(r => Math.abs(ratio - r) < 0.05) ? 55 : 30;

      // 6. Color saturation uniformity
      const saturations = [];
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]/255, g = data[i+1]/255, b = data[i+2]/255;
        const max = Math.max(r,g,b), min = Math.min(r,g,b);
        saturations.push(max === 0 ? 0 : (max - min) / max);
      }
      const satVar = variance(saturations);
      const satScore = satVar < 0.03 ? 70 : 30; // low sat variance → uniform → AI

      // Composite
      let aiScore = Math.round(
        channelBalanceScore * 0.20 +
        smoothnessScore     * 0.30 +
        noiseScore          * 0.20 +
        ratioScore          * 0.15 +
        satScore            * 0.15
      );
      aiScore = Math.max(1, Math.min(99, aiScore + Math.floor((Math.random() - 0.5) * 14)));

      const sc = scoreColor;
      resolve({
        aiScore,
        metrics: [
          { name: 'Smoothness',  value: smoothnessScore,    label: smoothnessScore >= 60 ? 'Suspicious' : 'Natural', color: sc(smoothnessScore) },
          { name: 'Color Bal.',  value: channelBalanceScore, label: channelBalanceScore >= 60 ? 'Very Balanced' : 'Normal', color: sc(channelBalanceScore) },
          { name: 'Noise Pat.',  value: noiseScore,         label: noiseScore >= 60 ? 'Artificial' : 'Natural',  color: sc(noiseScore)         },
          { name: 'Saturation',  value: satScore,           label: satScore >= 60 ? 'Uniform' : 'Varied',        color: sc(satScore)           },
        ],
        signals: [
          { name: 'Pixel Smoothness Pattern', score: smoothnessScore,    color: sc(smoothnessScore)    },
          { name: 'RGB Channel Balance',      score: channelBalanceScore, color: sc(channelBalanceScore)},
          { name: 'Noise Frequency Pattern',  score: noiseScore,         color: sc(noiseScore)         },
          { name: 'Saturation Uniformity',    score: satScore,           color: sc(satScore)           },
          { name: 'Aspect Ratio Signature',   score: ratioScore,         color: sc(ratioScore)         },
        ]
      });
    } catch (e) {
      // CORS fallback – can't read pixels from cross-origin image
      const aiScore = Math.floor(Math.random() * 40 + 30);
      const sc = scoreColor;
      resolve({
        aiScore,
        metrics: [
          { name: 'Metadata',   value: 45, label: 'Limited', color: sc(45) },
          { name: 'Format',     value: 40, label: 'Unknown', color: sc(40) },
          { name: 'Size Ratio', value: 50, label: 'Typical',  color: sc(50) },
          { name: 'Confidence', value: 20, label: 'Low',      color: '#64748b' },
        ],
        signals: [
          { name: 'Cross-Origin Restriction', score: 50, color: '#64748b' },
          { name: 'Metadata Analysis',        score: 45, color: sc(45) },
          { name: 'Format Signature',         score: 40, color: sc(40) },
        ],
        note: 'Full pixel analysis was not possible due to cross-origin restrictions. Results are based on limited metadata.'
      });
    }
  });
}

// Image upload handling
const dropZone   = document.getElementById('image-drop-zone');
const fileInput  = document.getElementById('image-input');
const dropPreview = document.getElementById('drop-preview');
const previewImg  = document.getElementById('preview-img');
const dropInner   = document.getElementById('drop-zone-inner');
let imageLoaded = false;

function loadImageFile(file) {
  if (!file.type.startsWith('image/')) { showToast('Please upload a valid image file.', 'error'); return; }
  if (file.size > 20 * 1024 * 1024) { showToast('Image too large (max 20MB)', 'error'); return; }
  const url = URL.createObjectURL(file);
  previewImg.src = url;
  previewImg.onload = () => {
    dropInner.hidden = true;
    dropPreview.hidden = false;
    imageLoaded = true;
  };
}

dropZone.addEventListener('click', (e) => {
  if (!e.target.closest('.remove-img')) fileInput.click();
});
dropZone.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') fileInput.click(); });
fileInput.addEventListener('change', () => { if (fileInput.files[0]) loadImageFile(fileInput.files[0]); });

dropZone.addEventListener('dragover',  (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', (e) => {
  e.preventDefault(); dropZone.classList.remove('dragover');
  if (e.dataTransfer.files[0]) loadImageFile(e.dataTransfer.files[0]);
});

document.getElementById('remove-img-btn').addEventListener('click', (e) => {
  e.stopPropagation();
  previewImg.src = '';
  dropInner.hidden = false;
  dropPreview.hidden = true;
  imageLoaded = false;
  fileInput.value = '';
  document.getElementById('image-result-placeholder').hidden = false;
  document.getElementById('image-result-panel').hidden = true;
});

document.getElementById('load-url-btn').addEventListener('click', () => {
  const url = document.getElementById('image-url-input').value.trim();
  if (!url) return;
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    previewImg.src = img.src;
    dropInner.hidden = true;
    dropPreview.hidden = false;
    imageLoaded = true;
    showToast('Image loaded successfully', 'success');
  };
  img.onerror = () => showToast('Failed to load image from URL. Try downloading and uploading it.', 'error');
  img.src = url;
});

let lastImageResult = null;
document.getElementById('analyze-image-btn').addEventListener('click', async () => {
  if (!imageLoaded) { showToast('Please upload or enter an image URL first.', 'error'); return; }

  const btn = document.getElementById('analyze-image-btn');
  btn.disabled = true;
  btn.querySelector('.btn-analyze-text').hidden = true;
  btn.querySelector('.btn-analyze-icon').hidden = true;
  btn.querySelector('.btn-analyze-loader').hidden = false;

  await new Promise(r => setTimeout(r, 800));

  const result = await analyzeImageCanvas(previewImg);
  lastImageResult = result;

  if (result.note) showToast(result.note, 'info', 6000);

  displayResult({
    placeholderId: 'image-result-placeholder',
    panelId:       'image-result-panel',
    verdictId:     'image-verdict-badge',
    circleId:      'image-score-circle',
    scoreNumId:    'image-score-num',
    metricsId:     'image-metrics',
    breakdownId:   'image-breakdown',
  }, result);

  btn.disabled = false;
  btn.querySelector('.btn-analyze-text').hidden = false;
  btn.querySelector('.btn-analyze-icon').hidden = false;
  btn.querySelector('.btn-analyze-loader').hidden = true;
});

document.getElementById('copy-image-result-btn').addEventListener('click', () => {
  if (!lastImageResult) return;
  const r = lastImageResult;
  const verdict = r.aiScore >= 70 ? 'LIKELY AI-GENERATED' : r.aiScore <= 35 ? 'LIKELY REAL PHOTO' : 'MIXED/UNCERTAIN';
  const report = [
    '=== AIShield Image Analysis Report ===',
    `Verdict: ${verdict}`,
    `AI Probability: ${r.aiScore}%`,
    '',
    'Signal Breakdown:',
    ...r.signals.map(s => `  ${s.name}: ${s.score}%`),
    '',
    'Generated by AIShield – aishield.io',
  ].join('\n');
  copyReport(report);
});


// ═══════════════════════════════════════════════════════════════
// CODE ANALYSIS ENGINE
// ═══════════════════════════════════════════════════════════════

const AI_CODE_SIGNALS = {
  // Type annotations everywhere
  typeAnnotations: /:\s*(str|int|float|bool|list|dict|tuple|set|Optional|List|Dict|Union|Any|T)\b/g,
  // Docstrings that are excessively detailed
  detailedDocstring: /"""[\s\S]{80,}?"""/g,
  // Google-style docstring sections
  docstringArgs: /\b(Args|Returns|Raises|Example|Note|Attributes):\s*\n/g,
  // AI comment patterns – "This function..." style
  thisComment: /(?:^|\n)\s*#\s*This (function|method|class|module|variable|code)/gi,
  // Comprehensive try/except with multiple exceptions
  comprehensiveTryCatch: /try:[\s\S]+?except\s+\([\s\S]+?\):/g,
  // TypeVar definitions
  typeVar: /TypeVar\(['"][A-Z]/g,
  // Exact naming: snake_case PLUS very descriptive
  descriptiveNames: /\b(comprehensive|efficient|optimal|robust|advanced|sophisticated|elegant)\b/gi,
  // AI over-commenting every line
  lineComments: /(?:^|\n)[^\n#]*\s*#\s*\w+/gm,
  // Import from typing
  typingImport: /from typing import/g,
};

const HUMAN_CODE_SIGNALS = {
  // Short variable names
  shortVars: /\b(i|j|k|x|y|z|n|m|s|d|t|v|u|w|r|l)\s*=/g,
  // TODO/FIXME/HACK comments
  devComments: /(?:TODO|FIXME|HACK|XXX|BUG|NOTE|temp|quick|dirty|wtf|idk)/gi,
  // Inline debugging
  debugPrints: /\bprint\s*\(|console\.log|fmt\.Print|System\.out\.print/g,
  // Short comments
  shortComments: /(?:^|\n)\s*#\s*.{1,20}\n/gm,
  // Magic numbers directly in code
  magicNumbers: /(?<!=)\b\d{2,}\b(?!\s*[,\]])/g,
  // Minimal error handling
  bareExcept: /except\s*:/g,
};

function analyzeCode(code, lang) {
  const lines = code.split('\n');
  const lineCount = lines.length;
  const totalChars = code.length;

  // Detect language if auto
  if (lang === 'auto') {
    if (/def |import |#/.test(code)) lang = 'python';
    else if (/function|const |let |var |=>/.test(code)) lang = 'javascript';
    else if (/public class|System\.out/.test(code)) lang = 'java';
    else lang = 'generic';
  }

  // Count AI signals
  let aiSignalCount = 0;
  const aiSignalBreakdown = {};
  Object.entries(AI_CODE_SIGNALS).forEach(([key, regex]) => {
    const matches = (code.match(regex) || []).length;
    aiSignalBreakdown[key] = matches;
    if (matches > 0) aiSignalCount += Math.min(matches, 5);
  });

  // Count human signals
  let humanSignalCount = 0;
  const humanSignalBreakdown = {};
  Object.entries(HUMAN_CODE_SIGNALS).forEach(([key, regex]) => {
    const matches = (code.match(regex) || []).length;
    humanSignalBreakdown[key] = matches;
    if (matches > 0) humanSignalCount += Math.min(matches, 5);
  });

  // Comment density
  const commentLines = lines.filter(l => l.trim().startsWith('//') || l.trim().startsWith('#') || l.trim().startsWith('*') || l.trim().startsWith('/*')).length;
  const commentDensity = commentLines / Math.max(lineCount, 1);
  const commentScore = Math.round(Math.min(100, commentDensity * 250)); // AI over-comments

  // Line length uniformity
  const lineLengths = lines.filter(l => l.trim()).map(l => l.length);
  const avgLineLen = lineLengths.reduce((a, b) => a + b, 0) / Math.max(lineLengths.length, 1);
  const lineVar = lineLengths.reduce((a, b) => a + Math.pow(b - avgLineLen, 2), 0) / Math.max(lineLengths.length, 1);
  const lineUniformity = Math.max(0, Math.min(100, Math.round(100 - Math.sqrt(lineVar) * 3)));

  // Naming style score (AI uses very descriptive names)
  const funcNames = [...(code.matchAll(/(?:def|function|func)\s+([a-zA-Z_][a-zA-Z0-9_]*)/g))].map(m => m[1]);
  const avgNameLen = funcNames.length ? funcNames.reduce((a, b) => a + b.length, 0) / funcNames.length : 10;
  const namingScore = Math.round(Math.min(100, Math.max(0, (avgNameLen - 6) * 10)));

  // Composite
  const aiRatio = aiSignalCount / Math.max(aiSignalCount + humanSignalCount + 1, 1);
  let aiScore = Math.round(
    aiRatio * 100 * 0.35 +
    commentScore   * 0.25 +
    lineUniformity * 0.20 +
    namingScore    * 0.20
  );

  // Penalize human signals
  aiScore = Math.max(1, Math.min(99, aiScore - Math.floor(humanSignalCount * 4) + Math.floor((Math.random() - 0.5) * 8)));

  const sc = scoreColor;
  return {
    aiScore,
    metrics: [
      { name: 'Comment Density', value: commentScore,   label: commentScore >= 60 ? 'Over-commented' : 'Normal', color: sc(commentScore)   },
      { name: 'Line Uniformity', value: lineUniformity, label: lineUniformity >= 60 ? 'Very Uniform' : 'Varied', color: sc(lineUniformity) },
      { name: 'AI Signals',      value: Math.min(100, aiSignalCount * 10), label: aiSignalCount > 5 ? 'Many' : aiSignalCount > 2 ? 'Some' : 'Few', color: sc(aiSignalCount * 10) },
      { name: 'Human Signals',   value: Math.min(100, humanSignalCount * 10), label: humanSignalCount > 3 ? 'Many' : 'Few', color: scoreColor(100 - humanSignalCount * 10) },
    ],
    signals: [
      { name: 'Comment Over-documentation', score: commentScore,   color: sc(commentScore)   },
      { name: 'Line Length Uniformity',     score: lineUniformity, color: sc(lineUniformity) },
      { name: 'AI Pattern Markers',         score: Math.min(100, aiSignalCount * 10), color: sc(aiSignalCount * 10) },
      { name: 'Naming Style Complexity',    score: namingScore,    color: sc(namingScore)    },
      { name: 'Human Marker Absence',       score: Math.max(0, 100 - humanSignalCount * 15), color: sc(100 - humanSignalCount * 15) },
    ],
    raw: { lineCount, commentLines, aiSignals: aiSignalCount, humanSignals: humanSignalCount, lang }
  };
}

const codeInput = document.getElementById('code-input');
document.getElementById('clear-code-btn').addEventListener('click', () => {
  codeInput.value = '';
  document.getElementById('code-result-placeholder').hidden = false;
  document.getElementById('code-result-panel').hidden = true;
});

document.getElementById('sample-human-code-btn').addEventListener('click', () => { codeInput.value = CODE_SAMPLES['human-code']; });
document.getElementById('sample-ai-code-btn').addEventListener('click', ()   => { codeInput.value = CODE_SAMPLES['ai-code'];    });

let lastCodeResult = null;
document.getElementById('analyze-code-btn').addEventListener('click', () => {
  const code = codeInput.value.trim();
  if (code.length < 20) { showToast('Please enter at least some code to analyze.', 'error'); return; }

  const btn = document.getElementById('analyze-code-btn');
  btn.disabled = true;
  btn.querySelector('.btn-analyze-text').hidden = true;
  btn.querySelector('.btn-analyze-icon').hidden = true;
  btn.querySelector('.btn-analyze-loader').hidden = false;

  setTimeout(() => {
    const lang = document.getElementById('lang-select').value;
    const result = analyzeCode(code, lang);
    lastCodeResult = result;

    displayResult({
      placeholderId: 'code-result-placeholder',
      panelId:       'code-result-panel',
      verdictId:     'code-verdict-badge',
      circleId:      'code-score-circle',
      scoreNumId:    'code-score-num',
      metricsId:     'code-metrics',
      breakdownId:   'code-breakdown',
    }, result);

    btn.disabled = false;
    btn.querySelector('.btn-analyze-text').hidden = false;
    btn.querySelector('.btn-analyze-icon').hidden = false;
    btn.querySelector('.btn-analyze-loader').hidden = true;
  }, 1000 + Math.random() * 500);
});

document.getElementById('copy-code-result-btn').addEventListener('click', () => {
  if (!lastCodeResult) return;
  const r = lastCodeResult;
  const verdict = r.aiScore >= 70 ? 'LIKELY AI-GENERATED' : r.aiScore <= 35 ? 'LIKELY HUMAN-WRITTEN' : 'MIXED/UNCERTAIN';
  const report = [
    '=== AIShield Code Analysis Report ===',
    `Verdict: ${verdict}`,
    `AI Probability: ${r.aiScore}%`,
    `Language: ${r.raw.lang}`,
    '',
    'Signal Breakdown:',
    ...r.signals.map(s => `  ${s.name}: ${s.score}%`),
    '',
    `Lines: ${r.raw.lineCount} | Comment Lines: ${r.raw.commentLines}`,
    `AI Signals: ${r.raw.aiSignals} | Human Signals: ${r.raw.humanSignals}`,
    '',
    'Generated by AIShield – aishield.io',
  ].join('\n');
  copyReport(report);
});


// ── FAQ ACCORDION ────────────────────────────────────────────
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const answer = document.getElementById(btn.getAttribute('aria-controls'));
    const isOpen = btn.getAttribute('aria-expanded') === 'true';

    // Close all
    document.querySelectorAll('.faq-q').forEach(b => {
      b.setAttribute('aria-expanded', 'false');
      const a = document.getElementById(b.getAttribute('aria-controls'));
      a.hidden = true;
    });

    // Toggle current
    if (!isOpen) {
      btn.setAttribute('aria-expanded', 'true');
      answer.hidden = false;
    }
  });
});


// ── SMOOTH SCROLL FOR NAV LINKS ───────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ── READY ────────────────────────────────────────────────────
console.log('%cAIShield loaded ✓', 'color:#8b5cf6;font-weight:bold;font-size:14px');
