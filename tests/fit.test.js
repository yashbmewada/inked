import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fitText, sizeBand, SHAPES, SIZE_CAPS, MARGINS } from '../js/layout.js';
import { fakeMeasure } from './helpers.js';

const box = { width: 864, height: 1080 };
const run = (o) => fitText({ title: '', box, cap: 64, measureAt: fakeMeasure, ...o });

test('short text in a large box returns the cap', () => {
  assert.equal(run({ text: 'Hello there.' }).size, 64);
});

test('doubling the text never grows the size', () => {
  const t = 'word '.repeat(300);
  assert.ok(run({ text: t + t }).size <= run({ text: t }).size);
});

test('5000 characters fit inside the box at any size', () => {
  const r = run({ text: 'lorem ipsum '.repeat(417) });
  assert.ok(r.height <= 1080);
  const m = fakeMeasure(r.size);
  for (const b of r.blocks) for (const l of b.lines) assert.ok(m(l) <= 864);
});

test('empty text gives no blocks and zero height', () => {
  const r = run({ text: '  \n\n ' });
  assert.equal(r.size, 64);
  assert.deepEqual(r.blocks, []);
  assert.equal(r.height, 0);
});

test('Arabic paragraph is rtl', () => {
  assert.equal(run({ text: 'مرحبا بالعالم' }).blocks[0].dir, 'rtl');
});

test('a title never grows the size', () => {
  const text = 'word '.repeat(400);
  assert.ok(run({ text, title: 'A title' }).size <= run({ text }).size);
});

test('sizeBand thresholds', () => {
  assert.equal(sizeBand(45), 'comfortable');
  assert.equal(sizeBand(44.5), 'small');
  assert.equal(sizeBand(30), 'small');
  assert.equal(sizeBand(29.5), 'tiny');
});

test('presets', () => {
  assert.equal(SHAPES.story.scale, 2.75);
  assert.equal(SIZE_CAPS.large, 88);
  assert.equal(MARGINS.normal, 0.11);
});
