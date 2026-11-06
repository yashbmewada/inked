import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_STATE, STORAGE_KEY, loadState, saveState,
  setTheme, saveMyTheme, removeMyTheme, clearLetter,
} from '../js/state.js';

const store = (value) => ({ getItem: () => value, setItem() {} });

test('loadState(null) returns defaults', () => {
  assert.deepEqual(loadState(null), DEFAULT_STATE);
});

test('loadState returns defaults when getItem throws', () => {
  const s = { getItem() { throw new Error('denied'); } };
  assert.deepEqual(loadState(s), DEFAULT_STATE);
});

test('loadState returns defaults for invalid JSON', () => {
  assert.deepEqual(loadState(store('{not json')), DEFAULT_STATE);
});

test('loadState reverts invalid enums and drops unknown keys', () => {
  const s = loadState(store('{"shape":"banner","textSize":"large","bogus":1}'));
  assert.equal(s.shape, 'portrait');
  assert.equal(s.textSize, 'large');
  assert.equal('bogus' in s, false);
});

test('loadState validates every field', () => {
  const s = loadState(store(JSON.stringify({
    themeId: 'nope', variant: 'blue', font: 'comic', margins: 'huge',
    textureOn: 'yes', textureChoice: 'dots', caption: 1, text: 5, title: null,
    myThemes: 'x',
  })));
  assert.deepEqual(s, DEFAULT_STATE);
});

test('loadState keeps valid values and well-formed myThemes only', () => {
  const good = { id: 'mine-1', name: 'A', baseThemeId: 'spring', font: 'hand', variant: 'dark',
    textureOn: true, textureChoice: 'grain', textSize: 'small', margins: 'wide' };
  const s = loadState(store(JSON.stringify({
    themeId: 'mine-1', variant: 'light', font: 'typed', margins: 'wide', textureOn: true,
    textureChoice: 'laid', caption: true, text: 'hi', title: 't',
    myThemes: [good, { id: 'mine-2' }, { ...good, id: 'mine-3', font: 'zzz' }, null],
  })));
  assert.deepEqual(s.myThemes, [good]);
  assert.equal(s.themeId, 'mine-1');
  assert.equal(s.font, 'typed');
  assert.equal(s.text, 'hi');
});

test('loadState rejects a mine- themeId that is not in myThemes', () => {
  assert.equal(loadState(store('{"themeId":"mine-9"}')).themeId, 'night');
});

test('saveState never throws and writes under STORAGE_KEY', () => {
  assert.doesNotThrow(() => saveState(DEFAULT_STATE, { setItem() { throw new Error('full'); } }));
  assert.doesNotThrow(() => saveState(DEFAULT_STATE, null));
  let k, v;
  saveState(DEFAULT_STATE, { setItem(a, b) { k = a; v = b; } });
  assert.equal(k, STORAGE_KEY);
  assert.deepEqual(JSON.parse(v), DEFAULT_STATE);
});

test('setTheme on a built-in changes only themeId', () => {
  const a = { ...DEFAULT_STATE, font: 'hand', textureOn: true, margins: 'wide' };
  const b = setTheme(a, 'spring');
  assert.equal(b.themeId, 'spring');
  assert.equal(b.font, 'hand');
  assert.equal(b.textureOn, true);
  assert.equal(b.margins, 'wide');
  assert.equal(a.themeId, 'night');
});

test('saveMyTheme then setTheme restores captured settings', () => {
  let s = { ...DEFAULT_STATE, themeId: 'spring', font: 'hand', variant: 'light',
    textureOn: true, textureChoice: 'lined', textSize: 'large', margins: 'narrow' };
  s = saveMyTheme(s, 'Mine');
  const t = s.myThemes[0];
  assert.match(t.id, /^mine-\d+$/);
  assert.equal(t.baseThemeId, 'spring');
  const changed = { ...s, font: 'clean', variant: 'dark', textureOn: false,
    textureChoice: null, textSize: 'small', margins: 'wide' };
  const r = setTheme(changed, t.id);
  assert.equal(r.themeId, t.id);
  assert.equal(r.font, 'hand');
  assert.equal(r.variant, 'light');
  assert.equal(r.textureOn, true);
  assert.equal(r.textureChoice, 'lined');
  assert.equal(r.textSize, 'large');
  assert.equal(r.margins, 'narrow');
});

test('saveMyTheme from a mine- theme resolves baseThemeId to the built-in', () => {
  let s = saveMyTheme({ ...DEFAULT_STATE, themeId: 'cream' }, 'One');
  s = setTheme(s, s.myThemes[0].id);
  const realNow = Date.now;
  Date.now = () => realNow() + 5;
  try { s = saveMyTheme(s, 'Two'); } finally { Date.now = realNow; }
  assert.equal(s.myThemes[1].baseThemeId, 'cream');
  assert.notEqual(s.myThemes[1].id, s.myThemes[0].id);
});

test('removeMyTheme falls back to base when selected', () => {
  const s = saveMyTheme({ ...DEFAULT_STATE, themeId: 'autumn' }, 'X');
  const id = s.myThemes[0].id;
  const sel = setTheme(s, id);
  const r = removeMyTheme(sel, id);
  assert.equal(r.themeId, 'autumn');
  assert.deepEqual(r.myThemes, []);
  const other = removeMyTheme({ ...sel, themeId: 'cream' }, id);
  assert.equal(other.themeId, 'cream');
});

test('clearLetter clears text and title only', () => {
  const s = saveMyTheme({ ...DEFAULT_STATE, text: 'a', title: 'b', font: 'typed' }, 'X');
  const c = clearLetter(s);
  assert.equal(c.text, '');
  assert.equal(c.title, '');
  assert.equal(c.font, 'typed');
  assert.deepEqual(c.myThemes, s.myThemes);
  assert.equal(s.text, 'a');
});

test('loadState keeps the Italic font, so the Anniversary font can be picked and saved', () => {
  assert.equal(loadState(store(JSON.stringify({ font: 'classic-italic' }))).font, 'classic-italic');
});
