import { DEFAULT_STATE, loadState, saveState } from './state.js';
import { resolveStyle } from './themes.js';
import { renderImage, loadFonts } from './render.js';
import { SHAPES } from './layout.js';
import { initEditor } from './editor.js';

const REDRAW_DELAY = 150;
const LABEL_LIMIT = 300;
const MAX_PIXELS = 16e6;

// Later tasks (editor, sheet, export) assign these.
export const hooks = {
  openEditor(focus) {},
  openSheet() {},
  onStateChange(state, result) {},
};

const $ = (id) => document.getElementById(id);
const els = {
  wrap: $('preview-wrap'),
  canvas: $('preview'),
  placeholder: $('placeholder'),
  shape: $('shape'),
  styleBtn: $('style-btn'),
  hint: $('hint'),
  tryStory: $('try-story'),
  save: $('save'),
  share: $('share'),
  live: $('live'),
};

const darkQuery = matchMedia('(prefers-color-scheme: dark)');

function storage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

let state = structuredClone(DEFAULT_STATE);
let lastBand = null;
let lastWidth = 0;
let timer = 0;
let ready = false;

export function getState() {
  return state;
}

export function update(fn) {
  state = fn(state);
  saveState(state, storage());
  clearTimeout(timer);
  timer = setTimeout(redraw, REDRAW_DELAY);
}

function ariaLabel({ title, text }) {
  const full = [title.trim(), text.trim()].filter(Boolean).join('. ');
  if (!full) return 'Blank letter';
  return full.length > LABEL_LIMIT ? full.slice(0, LABEL_LIMIT - 3).trimEnd() + '...' : full;
}

export function redraw() {
  if (!ready) return;
  clearTimeout(timer);
  const { w, h } = SHAPES[state.shape];
  const style = resolveStyle(state, darkQuery.matches);
  els.wrap.style.setProperty('--ar', String(w / h));
  els.wrap.style.setProperty('--margin', String(style.marginFrac));

  lastWidth = els.wrap.clientWidth;
  const cssWidth = lastWidth || w;
  const scale = Math.min((cssWidth * (window.devicePixelRatio || 1)) / w, Math.sqrt(MAX_PIXELS / (w * h)));
  const result = renderImage(els.canvas, { title: state.title, text: state.text }, style, state.shape, scale);

  for (const b of els.shape.querySelectorAll('[data-shape]')) {
    b.setAttribute('aria-pressed', String(b.dataset.shape === state.shape));
  }
  els.placeholder.hidden = !result.empty;
  els.canvas.setAttribute('aria-label', ariaLabel(state));

  const hasText = state.text.trim() !== '';
  els.save.disabled = !hasText;
  els.share.disabled = !hasText;

  const showHint = !result.empty && result.band !== 'comfortable' && state.shape !== 'story';
  const hintAppeared = showHint && els.hint.hidden;
  els.hint.hidden = !showHint;

  const band = result.empty ? null : result.band;
  if (band && lastBand && band !== lastBand) {
    els.live.textContent = `Text size: ${band}` + (hintAppeared ? '. Text is small. Try Story' : '');
  } else if (hintAppeared) {
    els.live.textContent = 'Text is small. Try Story';
  }
  if (band) lastBand = band;

  hooks.onStateChange(state, result);
}

function wire() {
  els.shape.addEventListener('click', (e) => {
    const b = e.target.closest('[data-shape]');
    if (b) update((s) => ({ ...s, shape: b.dataset.shape }));
  });
  els.tryStory.addEventListener('click', () => update((s) => ({ ...s, shape: 'story' })));
  els.wrap.addEventListener('click', (e) => {
    hooks.openEditor(e.target.closest('#title-hit') ? 'title' : 'text');
  });
  els.styleBtn.addEventListener('click', () => hooks.openSheet());

  darkQuery.addEventListener('change', () => {
    if (state.variant === null) redraw();
  });

  // Redraw at the new pixel size when the preview's box changes (shape, rotation, window size).
  new ResizeObserver(() => {
    if (els.wrap.clientWidth !== lastWidth) redraw();
  }).observe(els.wrap);
}

async function boot() {
  state = loadState(storage());
  wire();
  const editor = initEditor({ update, getState, onClose: redraw });
  hooks.openEditor = (focus) => editor.open(focus);
  const previous = hooks.onStateChange;
  hooks.onStateChange = (st, result) => {
    previous(st, result);
    editor.setBand(result.band);
  };
  try {
    await loadFonts();
  } catch {
    // fall back to system fonts
  }
  ready = true;
  redraw();
}

boot();
