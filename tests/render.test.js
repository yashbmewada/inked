import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32, safeBox, fontString } from '../js/render.js';
import { MOTIFS, motifRect } from '../js/motifs.js';
import { SHAPES, MARGINS } from '../js/layout.js';
import { THEMES, FALLBACK_STACK } from '../js/themes.js';

test('mulberry32 is deterministic and stays in [0, 1)', () => {
  const a = mulberry32(1);
  const b = mulberry32(1);
  for (let i = 0; i < 1000; i++) {
    const x = a();
    assert.equal(x, b());
    assert.ok(x >= 0 && x < 1);
  }
  assert.notEqual(mulberry32(2)(), mulberry32(1)());
});

test('safeBox insets by the margin when there is no motif', () => {
  assert.deepEqual(safeBox(1000, 1250, 0.1, null), { x: 100, y: 100, width: 800, height: 1050 });
});

test('safeBox never overlaps the motif, for every shape and margin', () => {
  for (const [key, motif] of Object.entries(MOTIFS)) {
    for (const { w, h } of Object.values(SHAPES)) {
      for (const m of Object.values(MARGINS)) {
        for (const frac of [m, m + 0.03]) {
          const box = safeBox(w, h, frac, motif);
          const r = motifRect(motif.placement, w, h);
          if (motif.zone.startsWith('top')) assert.ok(r.y + r.height <= box.y, `${key} top`);
          else assert.ok(box.y + box.height <= r.y, `${key} bottom`);
        }
      }
    }
  }
});

test('motifs stay within 6% of the canvas area, except Rainier', () => {
  for (const [key, motif] of Object.entries(MOTIFS)) {
    if (key === 'rainier') continue;
    for (const { w, h } of Object.values(SHAPES)) {
      const r = motifRect(motif.placement, w, h);
      assert.ok((r.width * r.height) / (w * h) <= 0.06, key);
    }
  }
});

test('Rainier is about 30% of the width, bottom right', () => {
  const r = motifRect(MOTIFS.rainier.placement, 1080, 1350);
  assert.equal(MOTIFS.rainier.zone, 'bottom-right');
  assert.ok(Math.abs(r.width / 1080 - 0.3) < 0.01);
});

test('every theme motif has a drawing', () => {
  for (const t of THEMES) if (t.motif) assert.ok(MOTIFS[t.motif], t.id);
});

test('fontString puts italic first and the fallback stack last', () => {
  assert.equal(
    fontString({ italic: true, family: 'EB Garamond' }, 64, 400),
    `italic 400 64px "EB Garamond", ${FALLBACK_STACK}`,
  );
  assert.equal(fontString({ italic: false, family: 'Kalam' }, 30, 300), `300 30px "Kalam", ${FALLBACK_STACK}`);
});
