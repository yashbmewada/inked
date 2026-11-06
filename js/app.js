import { DEFAULT_STATE, loadState, saveState } from './state.js';
import { resolveStyle } from './themes.js';
import { renderImage, loadFonts } from './render.js';
import { SHAPES } from './layout.js';
import { initEditor } from './editor.js';
import { initSheet } from './sheet.js';
import { fileName, capabilities, createExporter, share, copy, save } from './export.js';

const REDRAW_DELAY = 150;
const LABEL_LIMIT = 300;
const MAX_PIXELS = 16e6;
const IDLE_DELAY = 600;
const COPIED_MS = 1500;

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
  copy: $('copy'),
  caption: $('caption'),
  captionInput: $('caption-input'),
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
let idleTimer = 0;
let copiedTimer = 0;

const caps = capabilities();
const desktopQuery = matchMedia('(min-width: 900px)');

function renderBlob() {
  const { scale } = SHAPES[state.shape];
  const canvas = document.createElement('canvas');
  renderImage(canvas, { title: state.title, text: state.text }, resolveStyle(state, darkQuery.matches), state.shape, scale);
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}

const exporter = createExporter(renderBlob);

function scheduleIdlePrepare() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    if (state.text.trim() !== '') exporter.prepare();
  }, IDLE_DELAY);
}

function syncButtons() {
  const hasText = state.text.trim() !== '';
  const preparing = hasText && !exporter.ready();
  for (const b of [els.save, els.share, els.copy]) b.disabled = !hasText || preparing;
  els.save.textContent = preparing ? 'Preparing' : 'Save';
  els.share.textContent = preparing ? 'Preparing' : 'Share';
  if (preparing) els.copy.textContent = 'Preparing';
  else if (!copiedTimer) els.copy.textContent = 'Copy image';
}

// Phone: Save plus Share, or Save plus Copy image, or Save alone.
// Desktop: Share is primary when files can be shared, otherwise Copy image.
function layoutBar() {
  const desktop = desktopQuery.matches;
  els.share.hidden = !caps.shareFiles;
  els.copy.hidden = desktop ? !caps.copyImage : caps.shareFiles || !caps.copyImage;
  els.caption.hidden = !caps.shareFiles;
  const copyPrimary = desktop && !caps.shareFiles;
  els.copy.classList.toggle('btn-fill', copyPrimary);
  els.copy.classList.toggle('btn-outline', !copyPrimary);
}

export function getState() {
  return state;
}

export function update(fn) {
  const prev = state;
  state = fn(state);
  if (Object.keys(state).some((k) => k !== 'caption' && prev[k] !== state[k])) {
    exporter.invalidate();
    scheduleIdlePrepare();
  }
  saveState(state, storage());
  clearTimeout(timer);
  timer = setTimeout(redraw, REDRAW_DELAY);
}

function ariaLabel({ title, text }) {
  const full = [title.trim(), text.trim()].filter(Boolean).join('. ');
  if (!full) return 'Blank letter';
  return full.length > LABEL_LIMIT ? full.slice(0, LABEL_LIMIT - 3).trimEnd() + '...' : full;
}

// Clearing first makes a repeated message announce again.
function announce(message) {
  els.live.textContent = '';
  setTimeout(() => {
    els.live.textContent = message;
  }, 50);
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

  syncButtons();

  const showHint = !result.empty && result.band !== 'comfortable' && state.shape !== 'story';
  const hintAppeared = showHint && els.hint.hidden;
  els.hint.hidden = !showHint;

  const band = result.empty ? null : result.band;
  if (band && lastBand && band !== lastBand) {
    announce(`Text size: ${band}` + (hintAppeared ? '. Text is small. Try Story' : ''));
  } else if (hintAppeared) {
    announce('Text is small. Try Story');
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
    if (state.variant === null) {
      exporter.invalidate();
      scheduleIdlePrepare();
      redraw();
    }
  });
  desktopQuery.addEventListener('change', layoutBar);
  exporter.onChange(syncButtons);

  els.save.addEventListener('click', () => {
    const blob = exporter.ready();
    if (blob) save(blob, fileName(new Date()));
  });
  els.share.addEventListener('click', () => {
    const blob = exporter.ready();
    if (!blob) return;
    share(blob, { caption: state.caption && state.text.trim() ? state.text : null }).catch(() => {});
  });
  els.copy.addEventListener('click', () => {
    const blob = exporter.ready();
    if (!blob) return;
    copy(blob)
      .then(() => {
        els.copy.textContent = 'Copied';
        clearTimeout(copiedTimer);
        copiedTimer = setTimeout(() => {
          copiedTimer = 0;
          syncButtons();
        }, COPIED_MS);
      })
      .catch(() => {});
  });
  els.captionInput.addEventListener('change', () => {
    update((s) => ({ ...s, caption: els.captionInput.checked }));
  });

  // Redraw at the new pixel size when the preview's box changes (shape, rotation, window size).
  new ResizeObserver(() => {
    if (els.wrap.clientWidth !== lastWidth) redraw();
  }).observe(els.wrap);
}

async function boot() {
  state = loadState(storage());
  wire();
  layoutBar();
  els.captionInput.checked = state.caption;
  const editor = initEditor({
    update,
    getState,
    onClose: () => {
      redraw();
      exporter.prepare();
    },
  });
  hooks.openEditor = (focus) => editor.open(focus);
  const previous = hooks.onStateChange;
  hooks.onStateChange = (st, result) => {
    previous(st, result);
    editor.setBand(result.band);
  };
  // Style changes redraw at once rather than after the typing debounce.
  const sheet = initSheet({
    update: (fn) => {
      update(fn);
      redraw();
    },
    getState,
  });
  hooks.openSheet = () => sheet.open();
  const beforeSheet = hooks.onStateChange;
  hooks.onStateChange = (st, result) => {
    beforeSheet(st, result);
    sheet.refresh();
  };
  try {
    await loadFonts();
  } catch {
    // fall back to system fonts
  }
  ready = true;
  redraw();
  scheduleIdlePrepare();
}

boot();
