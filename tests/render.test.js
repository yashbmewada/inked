import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32, safeBox, fontString, dotPlacement } from '../js/render.js';
import { motifRect, STROKE } from '../js/motifs.js';
import { SHAPES, MARGINS } from '../js/layout.js';
import { FALLBACK_STACK, MOTIFS } from '../js/themes.js';

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

test('fontString puts italic first and the fallback stack last', () => {
  assert.equal(
    fontString({ italic: true, family: 'EB Garamond' }, 64, 400),
    `italic 400 64px "EB Garamond", ${FALLBACK_STACK}`,
  );
  assert.equal(fontString({ italic: false, family: 'Kalam' }, 30, 300), `300 30px "Kalam", ${FALLBACK_STACK}`);
});

test('signature dot diameter is 0.3 x size, clamped to 12..22', () => {
  const box = safeBox(1080, 1350, 0.11, null);
  assert.equal(dotPlacement(1080, 1350, box, 118.8, 10, false, null).r, 6);
  assert.equal(dotPlacement(1080, 1350, box, 118.8, 50, false, null).r, 7.5);
  assert.equal(dotPlacement(1080, 1350, box, 118.8, 88, false, null).r, 11);
});

test('signature dot sits in the bottom margin at the start edge', () => {
  const box = safeBox(1080, 1350, 0.11, null);
  const ltr = dotPlacement(1080, 1350, box, 118.8, 64, false, null);
  const rtl = dotPlacement(1080, 1350, box, 118.8, 64, true, null);
  const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} vs ${b}`);
  near(ltr.x - ltr.r, box.x);
  near(rtl.x + rtl.r, box.x + box.width);
  near(ltr.y, 1350 - 118.8 / 2);
});

test('signature dot never touches a bottom motif, in either direction', () => {
  for (const [key, motif] of Object.entries(MOTIFS)) {
    if (!motif.zone.startsWith('bottom')) continue;
    for (const { w, h } of Object.values(SHAPES)) {
      for (const m of Object.values(MARGINS)) {
        for (const size of [8, 30, 64, 88]) {
          for (const rtl of [false, true]) {
            const box = safeBox(w, h, m, motif);
            const d = dotPlacement(w, h, box, m * w, size, rtl, motif);
            const r = motifRect(motif.placement, w, h);
            const pad = STROKE / 2;
            const apart =
              d.x + d.r <= r.x - pad || d.x - d.r >= r.x + r.width + pad || d.y + d.r <= r.y - pad;
            assert.ok(apart, `${key} ${w}x${h} m${m} ${size} rtl=${rtl}`);
            assert.ok(d.y - d.r >= box.y + box.height, `${key} dot below text`);
          }
        }
      }
    }
  }
});
