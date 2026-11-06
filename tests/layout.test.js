import test from 'node:test';
import assert from 'node:assert/strict';
import { splitParagraphs, paragraphDirection, wrapParagraph } from '../js/layout.js';
import { fakeMeasure } from './helpers.js';

test('splitParagraphs normalises, splits, trims and drops empties', () => {
  assert.deepEqual(splitParagraphs('a\r\n\r\n\r\n  b  \n c\n\n'), ['a', 'b c']);
  assert.deepEqual(splitParagraphs('   \n\n  '), []);
});

test('paragraphDirection uses the first strong character', () => {
  assert.equal(paragraphDirection('عزيزتي سارة'), 'rtl');
  assert.equal(paragraphDirection('123 Dear'), 'ltr');
  assert.equal(paragraphDirection('« שלום'), 'rtl');
});

const noEdgeSpaces = (lines) => lines.forEach((l) => assert.ok(l === l.trim() && l.length > 0, `bad line "${l}"`));

test('wrapParagraph breaks on words', () => {
  const lines = wrapParagraph('aa bb cc', 3 * 10 * 0.5 + 0.1, fakeMeasure(10));
  assert.deepEqual(lines, ['aa', 'bb', 'cc']);
  noEdgeSpaces(lines);
});

test('wrapParagraph wraps Japanese without spaces', () => {
  const s = 'やかんは今でもあの朝と同じ音で鳴ります';
  const m = fakeMeasure(10);
  const lines = wrapParagraph(s, 50, m);
  assert.ok(lines.length > 1);
  lines.forEach((l) => assert.ok(m(l) <= 50));
  assert.equal(lines.join(''), s);
});

test('wrapParagraph splits a long word by grapheme', () => {
  const s = 'x'.repeat(200);
  const m = fakeMeasure(10);
  const lines = wrapParagraph(s, 100, m);
  lines.forEach((l) => assert.ok(m(l) <= 100));
  assert.equal(lines.join(''), s);
});

test('wrapParagraph keeps emoji sequences whole', () => {
  const lines = wrapParagraph('hi 👨‍👩‍👧 🇮🇳 ok', 15, fakeMeasure(10));
  for (const e of ['👨‍👩‍👧', '🇮🇳']) {
    assert.equal(lines.filter((l) => l.includes(e)).length, 1);
  }
  noEdgeSpaces(lines);
});

test('wrapParagraph keeps Devanagari clusters intact', () => {
  const s = 'क्षत्रिय नमस्ते';
  const lines = wrapParagraph(s, 20, fakeMeasure(10));
  assert.equal(lines.join('').replace(/ /g, ''), s.replace(/ /g, ''));
  noEdgeSpaces(lines);
});
