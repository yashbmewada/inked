import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defineTheme } from '../js/theme-engine.js';
import { THEMES, MOTIFS } from '../js/themes.js';

const base = {
  id: 'test', name: 'Test', group: 'seasons', font: 'clean',
  dark: { ground: '#101010', ink: '#F0F0F0', tint: '#888888' },
  light: { ground: '#F0F0F0', ink: '#101010', tint: '#888888' },
};
const motif = { zone: 'top-right', viewBox: [30, 30], width: 0.13, top: 0.05, side: 0.05, draw: ['M0 0 L30 30'] };

test('a minimal theme compiles with defaults', () => {
  const t = defineTheme(base);
  assert.equal(t.texture, 'plain');
  assert.equal(t.dot, null);
  assert.equal(t.motif, null);
});

test('a theme with a draw-list motif compiles', () => {
  const t = defineTheme({ ...base, motif });
  assert.equal(t.motif.zone, 'top-right');
  assert.ok(t.motif.height > 0);
  assert.equal(typeof t.motif.draw, 'function');
});

for (const [why, spec, message] of [
  ['bad id', { ...base, id: 'Bad Id' }, /id must be/],
  ['mine- id', { ...base, id: 'mine-x' }, /must not start/],
  ['unknown group', { ...base, group: 'weather' }, /group must be one of/],
  ['unknown font', { ...base, font: 'comic' }, /font must be one of/],
  ['unknown texture', { ...base, texture: 'dots' }, /texture must be one of/],
  ['bad colour', { ...base, dark: { ...base.dark, ink: 'white' } }, /dark\.ink must be/],
  ['low contrast', { ...base, light: { ground: '#F0F0F0', ink: '#AAAAAA', tint: '#888888' } }, /light ink on ground has contrast/],
  ['missing light', { ...base, light: null }, /needs a light variant/],
  ['plain with light', { ...base, group: 'plain' }, /single look/],
  ['bad zone', { ...base, motif: { ...motif, zone: 'middle' } }, /motif: zone/],
  ['too wide', { ...base, motif: { ...motif, width: 0.6 } }, /motif: width/],
  ['missing side', { ...base, motif: { ...motif, side: undefined } }, /motif: side/],
  ['nothing to draw', { ...base, motif: { ...motif, draw: [] } }, /motif: needs a draw list/],
  ['cap scale out of range', { ...base, capScale: 3 }, /capScale/],
]) {
  test(`defineTheme rejects ${why}, naming the theme`, () => {
    assert.throws(() => defineTheme(spec), (e) => message.test(e.message) && e.message.startsWith(`Theme "${spec.id}"`));
  });
}

test('every motif is keyed by its theme id', () => {
  assert.deepEqual(Object.keys(MOTIFS), THEMES.filter((t) => t.motif).map((t) => t.id));
});
