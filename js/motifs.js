// Turns a theme's motif spec into something the renderer can place and draw.
// A motif is drawn in its own viewBox space, then scaled onto the canvas.
// Width and offsets are fractions of the canvas width.

export const STROKE = 4;
export const ZONES = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'];
const MIN_MARGIN = 0.07;
const GAP = 0.03;
const MAX_WIDTH = 0.4;

// The motif's bounding rectangle on a w x h canvas, in canvas units.
export function motifRect(p, w, h) {
  const width = p.width * w;
  const height = width * (p.viewBox[1] / p.viewBox[0]);
  let x = (w - width) / 2;
  if (p.zone.endsWith('right')) x = w - p.side * w - width;
  if (p.zone.endsWith('left')) x = p.side * w;
  const y = p.zone.startsWith('top') ? p.top * w : h - p.bottom * w - height;
  return { x, y, width, height };
}

const isFraction = (n, hi = 1) => typeof n === 'number' && n >= 0 && n <= hi;

// draw items: 'M...' strokes a path in the tint; { d, alpha } strokes it fainter;
// { d, fill: true } fills it in the tint; { d, fill: '#RRGGBB' } fills it in that colour.
function drawItems(ctx, items) {
  for (const item of items) {
    const { d, alpha = 1, fill = false } = typeof item === 'string' ? { d: item } : item;
    const path = new Path2D(d);
    ctx.save();
    ctx.globalAlpha *= alpha;
    if (fill) {
      if (fill !== true) ctx.fillStyle = fill;
      ctx.fill(path);
    } else {
      ctx.stroke(path);
    }
    ctx.restore();
  }
}

function check(spec) {
  if (!ZONES.includes(spec.zone)) throw new Error(`zone must be one of ${ZONES.join(', ')}`);
  const vb = spec.viewBox;
  if (!Array.isArray(vb) || vb.length !== 2 || !(vb[0] > 0) || !(vb[1] > 0)) {
    throw new Error('viewBox must be [width, height]');
  }
  if (!(spec.width > 0) || spec.width > MAX_WIDTH) throw new Error(`width must be above 0 and at most ${MAX_WIDTH}`);
  const edge = spec.zone.startsWith('top') ? 'top' : 'bottom';
  if (!isFraction(spec[edge], 0.2)) throw new Error(`${edge} is required, from 0 to 0.2`);
  if (!spec.zone.endsWith('center') && !isFraction(spec.side, 0.2)) throw new Error('side is required, from 0 to 0.2');
  const hasDraw = Array.isArray(spec.draw) && spec.draw.length > 0;
  if (!hasDraw && typeof spec.paint !== 'function') throw new Error('needs a draw list or a paint function');
  for (const item of spec.draw ?? []) {
    const d = typeof item === 'string' ? item : item?.d;
    if (typeof d !== 'string' || !d.trim()) throw new Error('each draw item is a path string or { d, alpha, fill }');
  }
}

export function compileMotif(spec) {
  check(spec);
  const p = {
    zone: spec.zone, viewBox: spec.viewBox, width: spec.width,
    top: spec.top, bottom: spec.bottom, side: spec.side ?? 0,
  };
  const edge = p.zone.startsWith('top') ? p.top : p.bottom;
  const extent = edge + p.width * (p.viewBox[1] / p.viewBox[0]) + STROKE / 2 / 1080;
  return {
    zone: p.zone,
    // The text area's reserved band, measured from the margin inset so the narrowest margin still clears the motif.
    height: Math.round((extent + GAP - MIN_MARGIN) * 10000) / 10000,
    placement: p,
    draw(ctx, { w, h, tint, variant }) {
      const r = motifRect(p, w, h);
      const s = r.width / p.viewBox[0];
      ctx.save();
      ctx.translate(r.x, r.y);
      ctx.scale(s, s);
      ctx.lineWidth = STROKE / s;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = tint;
      ctx.fillStyle = tint;
      if (spec.draw) drawItems(ctx, spec.draw);
      if (spec.paint) spec.paint(ctx, { variant, tint });
      ctx.restore();
    },
  };
}
