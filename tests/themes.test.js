import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { THEMES, FONTS, GROUPS, resolveStyle, getTheme } from '../js/themes.js';
import { contrastRatio } from '../js/color.js';
import { DEFAULT_STATE } from '../js/state.js';

test('contrastRatio matches WCAG extremes', () => {
  assert.equal(Math.round(contrastRatio('#000000', '#FFFFFF')), 21);
  assert.equal(contrastRatio('#123456', '#123456'), 1);
});

test('every theme variant has ink contrast of at least 7', () => {
  for (const t of THEMES) {
    for (const v of [t.dark, t.light]) {
      if (!v) continue;
      assert.ok(contrastRatio(v.ground, v.ink) >= 7, `${t.id} ${v.ground}/${v.ink}`);
    }
  }
});

test('every non-Plain theme has a light variant', () => {
  for (const t of THEMES) {
    if (t.group === 'plain') assert.equal(t.light, null, t.id);
    else assert.ok(t.light, t.id);
  }
});

test('themes are grouped in tab order, with the shipped themes first', () => {
  const groups = Object.keys(GROUPS);
  const order = THEMES.map((t) => groups.indexOf(t.group));
  assert.deepEqual(order, [...order].sort((x, y) => x - y));
  assert.deepEqual(THEMES.slice(0, 5).map((t) => t.id), ['night', 'cream', 'blush', 'sage', 'inkblue']);
});

test('every file in js/themes/ is listed in index.js, under its own id', () => {
  const dir = new URL('../js/themes/', import.meta.url);
  const files = readdirSync(dir).filter((f) => f.endsWith('.js') && f !== 'index.js').map((f) => f.slice(0, -3));
  assert.deepEqual(THEMES.map((t) => t.id).sort(), files.sort());
});

test('fonts table', () => {
  assert.deepEqual(Object.keys(FONTS), ['clean', 'classic', 'classic-italic', 'hand', 'typed']);
  assert.equal(FONTS.hand.family, 'Kalam');
});

test('getTheme looks up by id', () => {
  assert.equal(getTheme('eid').name, 'Eid');
  assert.equal(getTheme('nope'), undefined);
});

test('anniversary is italic Classic, and Classic applies upright', () => {
  const a = resolveStyle({ ...DEFAULT_STATE, themeId: 'anniversary' }, true);
  assert.equal(a.italic, true);
  assert.equal(a.family, 'EB Garamond');
  const b = resolveStyle({ ...DEFAULT_STATE, themeId: 'anniversary', font: 'classic' }, true);
  assert.equal(b.italic, false);
});

test('spring with overrides', () => {
  const s = resolveStyle({ ...DEFAULT_STATE, themeId: 'spring', font: 'typed', textureOn: true, textureChoice: 'lined', margins: 'wide', textSize: 'large' }, false);
  assert.equal(s.family, 'Courier Prime');
  assert.equal(s.texture, 'lined');
  assert.equal(s.marginFrac, 0.15);
  assert.equal(s.cap, 88);
  assert.equal(s.ground, '#F5F3E6');
});

test('sympathy margin boost and cap scale', () => {
  const s = resolveStyle({ ...DEFAULT_STATE, themeId: 'sympathy', margins: 'normal' }, true);
  assert.ok(Math.abs(s.marginFrac - 0.14) < 1e-9);
  assert.ok(Math.abs(s.cap - 54.4) < 1e-9);
  assert.equal(s.dot, '#5A5854');
});

test('night has no light variant and a vermilion dot', () => {
  const s = resolveStyle({ ...DEFAULT_STATE, variant: 'light' }, false);
  assert.equal(s.ground, '#0E0E0D');
  assert.equal(s.dot, '#D0533A');
});

test('texture maps off, plain and theme defaults', () => {
  assert.equal(resolveStyle(DEFAULT_STATE, true).texture, 'none');
  assert.equal(resolveStyle({ ...DEFAULT_STATE, textureOn: true }, true).texture, 'grain');
  assert.equal(resolveStyle({ ...DEFAULT_STATE, themeId: 'thankyou', textureOn: true }, true).texture, 'laid');
});

test('variant follows the device when unset', () => {
  assert.equal(resolveStyle({ ...DEFAULT_STATE, themeId: 'cream' }, false).ground, '#F3EEE3');
  assert.equal(resolveStyle({ ...DEFAULT_STATE, themeId: 'diwali' }, true).ground, '#1A1410');
  assert.equal(resolveStyle({ ...DEFAULT_STATE, themeId: 'diwali' }, false).ground, '#FAF1E2');
});

test('mine themes resolve through baseThemeId, falling back to night', () => {
  const myThemes = [{ id: 'mine-1', name: 'x', baseThemeId: 'eid' }];
  assert.equal(resolveStyle({ ...DEFAULT_STATE, themeId: 'mine-1', myThemes }, true).motif, 'eid');
  assert.equal(resolveStyle({ ...DEFAULT_STATE, themeId: 'mine-9', myThemes }, true).ground, '#0E0E0D');
});
