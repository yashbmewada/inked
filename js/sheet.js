import { THEMES, getTheme, resolveStyle } from './themes.js';
import { setTheme, saveMyTheme, removeMyTheme } from './state.js';
import { renderImage } from './render.js';
import { trapFocus } from './focus-trap.js';

const THUMB_SCALE = 0.12;
const THUMB_LETTER = { title: '', text: 'Dear Sam,' };
const SLIDE_MS = 180;

const GROUPS = [
  ['plain', 'Plain'],
  ['seasons', 'Seasons'],
  ['places', 'Places'],
  ['occasions', 'Occasions'],
  ['mine', 'Mine'],
];
const FONT_CHIPS = [['theme', 'Theme'], ['clean', 'Clean'], ['classic', 'Classic'], ['hand', 'Hand'], ['typed', 'Typed']];
const SIZE_CHIPS = [['small', 'Small'], ['medium', 'Medium'], ['large', 'Large']];
const MARGIN_CHIPS = [['narrow', 'Narrow'], ['normal', 'Normal'], ['wide', 'Wide']];
const TEXTURE_CHIPS = [['grain', 'Grain'], ['lined', 'Lined'], ['laid', 'Laid']];
const FONT_NAMES = { clean: 'Clean', classic: 'Classic', 'classic-italic': 'Classic italic', hand: 'Hand', typed: 'Typed' };
const PAPER_NAMES = { none: 'Plain', grain: 'Grain', lined: 'Lined', laid: 'Laid' };

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else node.setAttribute(k, v);
  }
  for (const c of children) node.append(c);
  return node;
}

function chipRow(label, options, onPick) {
  const row = el('div', { class: 'chips', role: 'group', 'aria-label': label });
  for (const [value, text] of options) {
    row.append(el('button', { class: 'chip', type: 'button', 'data-value': value, 'aria-pressed': 'false', text }));
  }
  row.addEventListener('click', (e) => {
    const b = e.target.closest('[data-value]');
    if (b) onPick(b.dataset.value);
  });
  return row;
}

function markRow(row, selected) {
  for (const b of row.querySelectorAll('[data-value]')) {
    b.setAttribute('aria-pressed', String(b.dataset.value === selected));
  }
}

const baseTheme = (state, id) => {
  const mine = state.myThemes.find((t) => t.id === id);
  return getTheme(mine ? mine.baseThemeId : id) || getTheme('night');
};

export function initSheet({ update, getState }) {
  const root = document.getElementById('sheet');
  const backdrop = document.getElementById('sheet-backdrop');
  const styleBtn = document.getElementById('style-btn');
  const desktop = matchMedia('(min-width: 900px)');
  const darkQuery = matchMedia('(prefers-color-scheme: dark)');

  let isOpen = false;
  let closing = false;
  let hideTimer = 0;
  let releaseTrap = null;
  // Each open gets its own history entry id, so a stale entry left by a reload cannot keep the sheet open.
  let entryId = 0;
  let tab = null;
  let stripKey = '';
  const thumbs = new Map();

  const strip = el('div', { class: 'strip', role: 'group', 'aria-label': 'Themes' });
  const themeLine = el('p', { class: 'theme-line' });
  const tabs = chipRow('Theme group', GROUPS, (value) => {
    tab = value;
    refresh();
  });
  tabs.classList.add('tabs');
  const variantRow = el('div', { class: 'segmented variant', role: 'group', 'aria-label': 'Image colours' }, [
    el('button', { type: 'button', 'data-value': 'dark', 'aria-pressed': 'false', text: 'Dark' }),
    el('button', { type: 'button', 'data-value': 'light', 'aria-pressed': 'false', text: 'Light' }),
  ]);
  variantRow.addEventListener('click', (e) => {
    const b = e.target.closest('[data-value]');
    if (b) update((s) => ({ ...s, variant: b.dataset.value }));
  });
  const fonts = chipRow('Font', FONT_CHIPS, (font) => update((s) => ({ ...s, font })));
  const sizes = chipRow('Text size', SIZE_CHIPS, (textSize) => update((s) => ({ ...s, textSize })));
  const margins = chipRow('Margins', MARGIN_CHIPS, (m) => update((s) => ({ ...s, margins: m })));
  const textureSwitch = el('button', { class: 'switch', type: 'button', role: 'switch', 'aria-checked': 'false' }, [
    el('span', { text: 'Paper texture' }),
    el('span', { class: 'track', 'aria-hidden': 'true' }),
  ]);
  textureSwitch.addEventListener('click', () => update((s) => ({ ...s, textureOn: !s.textureOn })));
  const textures = chipRow('Paper', TEXTURE_CHIPS, (textureChoice) => update((s) => ({ ...s, textureChoice })));
  const saveLink = el('button', { class: 'link save-theme', type: 'button', text: 'Save as my theme' });
  saveLink.addEventListener('click', () => {
    const name = (prompt('Save as my theme') ?? '').trim();
    if (!name) return;
    tab = 'mine';
    update((s) => {
      const next = saveMyTheme(s, name);
      return { ...next, themeId: next.myThemes[next.myThemes.length - 1].id };
    });
  });

  root.append(strip, themeLine, tabs, variantRow, fonts, sizes, margins, textureSwitch, textures, saveLink);
  root.tabIndex = -1;

  strip.addEventListener('click', (e) => {
    const remove = e.target.closest('[data-remove]');
    if (remove) {
      update((s) => removeMyTheme(s, remove.dataset.remove));
      return;
    }
    const pick = e.target.closest('[data-theme]');
    if (pick) update((s) => setTheme(s, pick.dataset.theme));
  });

  // The thumbnail shows what picking the theme would give with the current font, colours and paper.
  function thumbStyle(state, entry) {
    if (entry.mine) {
      const m = entry.mine;
      return resolveStyle({ ...state, ...m, themeId: m.baseThemeId }, darkQuery.matches);
    }
    return resolveStyle({ ...state, themeId: entry.id, textSize: 'medium', margins: 'normal' }, darkQuery.matches);
  }

  function thumbCanvas(key, style) {
    let canvas = thumbs.get(key);
    if (canvas) return canvas;
    canvas = el('canvas', { 'aria-hidden': 'true' });
    renderImage(canvas, THUMB_LETTER, style, 'portrait', THUMB_SCALE);
    // Thumbnails drawn before the fonts arrive are redrawn next time.
    if (document.fonts.status === 'loaded') thumbs.set(key, canvas);
    return canvas;
  }

  function renderStrip(state) {
    const entries = tab === 'mine'
      ? state.myThemes.map((m) => ({ id: m.id, name: m.name, mine: m }))
      : THEMES.filter((t) => t.group === tab).map((t) => ({ id: t.id, name: t.name }));
    const items = entries.map((entry) => {
      const style = thumbStyle(state, entry);
      const key = [entry.id, style.ground, style.fontKey, style.texture].join('|');
      return { entry, style, key };
    });
    const nextKey = document.fonts.status + '#' + tab + '#' + state.themeId + '#' + items.map((i) => i.key).join(',');
    if (nextKey === stripKey) return;
    stripKey = nextKey;

    strip.replaceChildren(...items.map(({ entry, style, key }) => {
      const pick = el('button', {
        class: 'thumb', type: 'button', 'data-theme': entry.id,
        'aria-label': entry.name, 'aria-pressed': String(entry.id === state.themeId),
      }, [thumbCanvas(key, style)]);
      if (!entry.mine) return pick;
      const remove = el('button', {
        class: 'thumb-remove', type: 'button', 'data-remove': entry.id, 'aria-label': `Remove ${entry.name}`,
      });
      remove.innerHTML = '<svg width="10" height="10" viewBox="0 0 10 10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" aria-hidden="true"><line x1="2" y1="2" x2="8" y2="8"/><line x1="8" y1="2" x2="2" y2="8"/></svg>';
      return el('div', { class: 'thumb-wrap' }, [pick, remove]);
    }));
  }

  function currentGroup(state) {
    if (state.themeId.startsWith('mine-')) return 'mine';
    return baseTheme(state, state.themeId).group;
  }

  function refresh() {
    const state = getState();
    if (!tab) tab = currentGroup(state);
    const theme = baseTheme(state, state.themeId);
    const style = resolveStyle(state, darkQuery.matches);
    const mine = state.myThemes.find((t) => t.id === state.themeId);

    markRow(tabs, tab);
    themeLine.textContent = [mine ? mine.name : theme.name, FONT_NAMES[style.fontKey], PAPER_NAMES[style.texture]].join(' · ');

    variantRow.hidden = theme.group === 'plain';
    const variant = state.variant ?? (darkQuery.matches ? 'dark' : 'light');
    markRow(variantRow, variant);
    markRow(fonts, state.font);
    markRow(sizes, state.textSize);
    markRow(margins, state.margins);
    textureSwitch.setAttribute('aria-checked', String(state.textureOn));
    textures.hidden = !state.textureOn;
    const suggested = theme.texture === 'plain' ? 'grain' : theme.texture;
    markRow(textures, state.textureChoice ?? suggested);

    if (isOpen || desktop.matches) renderStrip(state);
  }

  function place() {
    clearTimeout(hideTimer);
    if (desktop.matches) {
      if (isOpen) requestClose();
      setDialog(false);
      root.hidden = false;
      refresh();
    } else if (!isOpen) {
      root.hidden = true;
    }
  }

  // On phones the open sheet is a modal dialog; inline on desktop it is a plain region.
  function setDialog(on) {
    if (on) {
      root.setAttribute('role', 'dialog');
      root.setAttribute('aria-modal', 'true');
      releaseTrap ??= trapFocus(root);
    } else {
      root.removeAttribute('role');
      root.removeAttribute('aria-modal');
      releaseTrap?.();
      releaseTrap = null;
    }
  }

  function open() {
    if (desktop.matches || isOpen) return;
    isOpen = true;
    setDialog(true);
    closing = false;
    clearTimeout(hideTimer);
    tab = currentGroup(getState());
    refresh();
    root.hidden = false;
    backdrop.hidden = false;
    document.body.classList.add('sheet-open');
    entryId = Date.now() + Math.random();
    history.pushState({ sheet: entryId }, '');
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('is-open')));
    root.focus({ preventScroll: true });
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    closing = false;
    setDialog(false);
    root.classList.remove('is-open');
    backdrop.hidden = true;
    document.body.classList.remove('sheet-open');
    if (!desktop.matches) {
      hideTimer = setTimeout(() => {
        if (!isOpen && !desktop.matches) root.hidden = true;
      }, SLIDE_MS);
      styleBtn.focus({ preventScroll: true });
    }
  }

  function requestClose() {
    if (!isOpen || closing) return;
    closing = true;
    history.back();
  }

  addEventListener('popstate', () => {
    if (isOpen && history.state?.sheet !== entryId) close();
  });
  backdrop.addEventListener('click', requestClose);
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) requestClose();
  });
  desktop.addEventListener('change', place);
  // The strip thumbnails and the Dark/Light marking follow the device scheme while the variant is unset.
  darkQuery.addEventListener('change', () => {
    stripKey = '';
    refresh();
  });

  place();
  return { open, close, refresh };
}
