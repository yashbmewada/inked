import { clearLetter } from './state.js';
import { trapFocus } from './focus-trap.js';

const CONFIRM_MS = 3000;
const DANGER = '#ff453a';

export function initEditor({ update, getState, onClose = () => {} }) {
  const $ = (id) => document.getElementById(id);
  const root = $('editor');
  const title = $('title-input');
  const text = $('text-input');
  const readout = $('size-readout');
  const done = $('done');
  const clear = $('clear');
  const desktop = matchMedia('(min-width: 900px)');
  const vv = window.visualViewport;

  let isOpen = false;
  let closing = false;
  let band = 'comfortable';
  let clearTimer = 0;
  let releaseTrap = null;
  let opener = null;

  title.dir = 'auto';
  text.dir = 'auto';

  function sync() {
    const s = getState();
    if (title.value !== s.title) title.value = s.title;
    if (text.value !== s.text) text.value = s.text;
  }

  function showBand(next) {
    band = next || 'comfortable';
    readout.textContent = `Text size: ${band}`;
  }

  function placeBar() {
    if (!vv) return;
    const covered = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
    root.style.setProperty('--kb', `${covered}px`);
  }

  function resetClear() {
    clearTimeout(clearTimer);
    clearTimer = 0;
    clear.textContent = 'Clear';
    clear.style.color = '';
  }

  function open(focus = 'text') {
    if (desktop.matches) {
      sync();
      (focus === 'title' ? title : text).focus();
      return;
    }
    if (isOpen) return;
    isOpen = true;
    opener = document.activeElement === document.body ? $('edit-letter') : document.activeElement;
    sync();
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.classList.add('is-open');
    releaseTrap = trapFocus(root);
    history.pushState({ editor: true }, '');
    placeBar();
    const field = focus === 'title' ? title : text;
    field.focus();
    const end = field.value.length;
    field.setSelectionRange(end, end);
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    closing = false;
    root.classList.remove('is-open');
    root.removeAttribute('role');
    root.removeAttribute('aria-modal');
    releaseTrap?.();
    releaseTrap = null;
    resetClear();
    onClose();
    if (opener?.isConnected) opener.focus({ preventScroll: true });
    opener = null;
  }

  title.addEventListener('input', () => update((s) => ({ ...s, title: title.value })));
  text.addEventListener('input', () => update((s) => ({ ...s, text: text.value })));

  done.addEventListener('click', () => {
    if (!isOpen || closing) return;
    closing = true;
    history.back();
  });
  addEventListener('popstate', () => {
    if (isOpen && !history.state?.editor) close();
  });
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !e.isComposing && isOpen && !closing) {
      closing = true;
      history.back();
    }
  });

  clear.addEventListener('click', () => {
    if (clearTimer) {
      resetClear();
      update(clearLetter);
      sync();
      return;
    }
    clear.textContent = 'Clear all?';
    clear.style.color = DANGER;
    clearTimer = setTimeout(resetClear, CONFIRM_MS);
  });

  if (vv) {
    vv.addEventListener('resize', placeBar);
    vv.addEventListener('scroll', placeBar);
  }

  sync();
  return { open, close, setBand: showBand };
}
