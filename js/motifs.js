// Theme motifs, ported from the inline SVGs in the design mockups.
// Each motif is drawn in its own viewBox space and scaled onto the canvas.
// Placement offsets and widths are fractions of the canvas width.

export const STROKE = 1.5;
const MIN_MARGIN = 0.07;
const GAP = 0.03;

const BLOSSOM = { light: '#E58FA2', dark: '#EBA0B1' };
const BLOSSOM_CENTRE = '#F3C969';

const stroke = (ctx, d) => ctx.stroke(new Path2D(d));

function blossom(ctx, cx, cy, r, colour) {
  const dist = r * 1.33;
  ctx.fillStyle = colour;
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    ctx.beginPath();
    ctx.arc(cx + dist * Math.cos(a), cy + dist * Math.sin(a), r, 0, 2 * Math.PI);
    ctx.fill();
  }
  ctx.fillStyle = BLOSSOM_CENTRE;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.6, 0, 2 * Math.PI);
  ctx.fill();
}

function leaf(ctx, cx, cy, rx, ry, deg) {
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, (deg * Math.PI) / 180, 0, 2 * Math.PI);
  ctx.stroke();
}

function dot(ctx, cx, cy, r) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, 2 * Math.PI);
  ctx.fill();
}

const PAINT = {
  blossom(ctx, { variant }) {
    stroke(ctx, 'M4 27 Q16 20 24 12 Q29 7 36 4');
    stroke(ctx, 'M16 19 Q15 14 18 11');
    stroke(ctx, 'M26 10.5 Q30 12 33 10');
    leaf(ctx, 11, 21, 3.6, 1.6, -50);
    leaf(ctx, 29, 7, 3.2, 1.4, 25);
    const pink = BLOSSOM[variant] ?? BLOSSOM.dark;
    blossom(ctx, 18, 11, 1.42, pink);
    blossom(ctx, 33, 10, 1.2, pink);
    blossom(ctx, 36, 4, 0.98, pink);
    blossom(ctx, 22, 15.5, 0.9, pink);
  },
  cloud(ctx) {
    stroke(ctx, 'M8 16 Q4 16 4 12.5 Q4 9 8 9.5 Q9 5 13.5 5 Q18 5 19 9 Q24 8.5 24.5 12.5 Q25 16 21 16 Z');
    stroke(ctx, 'M9 19.5 L8 22.5 M14 19 L12.6 23.5 M19.5 19.5 L18.5 22.5 M11.3 25.5 L10.8 27.5 M16.8 25.5 L16.2 28');
  },
  leaf(ctx) {
    stroke(ctx, 'M6 24 C6 12 14 6 24 6 C24 16 18 24 6 24 Z M6 24 L18 12');
  },
  snowflake(ctx) {
    for (let i = 0; i < 6; i++) {
      ctx.save();
      ctx.translate(15, 15);
      ctx.rotate((i * Math.PI) / 3);
      ctx.translate(-15, -15);
      stroke(ctx, 'M15 15 L15 4 M15 8 L12 5 M15 8 L18 5');
      ctx.restore();
    }
  },
  rainier(ctx) {
    stroke(ctx, 'M14 28 L28 13 L31 9 Q34 6 37 9 L44 15 L62 28');
    stroke(ctx, 'M28 13 L30.5 14 L32.5 11.5 L34.5 13.5 L37 11 L39.5 13 L44 15');
    ctx.save();
    ctx.globalAlpha *= 0.55;
    stroke(ctx, 'M0.5 28 L63 28');
    ctx.restore();
    stroke(ctx, 'M4 28 L4 25.25 M0.48 25.25 L4 17 L7.52 25.25 Z M1.36 21.95 L4 17 L6.64 21.95');
    stroke(ctx, 'M9 28 L9 25.875 M6.28 25.875 L9 19.5 L11.72 25.875 Z M6.96 23.325 L9 19.5 L11.04 23.325');
    stroke(ctx, 'M13.2 28 L13.2 26.5 M11.28 26.5 L13.2 22 L15.12 26.5 Z M11.76 24.7 L13.2 22 L14.64 24.7');
  },
  candle(ctx) {
    stroke(ctx, 'M12 13 L18 13 L18 28 L12 28 Z');
    stroke(ctx, 'M15 3 C18 7 18 10 15 11 C12 10 12 7 15 3 Z');
  },
  rings(ctx) {
    stroke(ctx, 'M21 12 A8 8 0 1 1 5 12 A8 8 0 1 1 21 12 Z');
    stroke(ctx, 'M31 12 A8 8 0 1 1 15 12 A8 8 0 1 1 31 12 Z');
  },
  mobile(ctx) {
    stroke(ctx, 'M8 4 Q25 1 42 4');
    stroke(ctx, 'M25 0.5 L25 2.6 M11 4 L11 15 M25 2.8 L25 19 M39 4 L39 12');
    stroke(ctx, 'M13.5 17 A4 4 0 1 1 13.5 23 A3 3 0 1 0 13.5 17 Z');
    stroke(ctx, 'M25 19.5 l1.3 2.7 3 .4 -2.2 2.1 .5 3 -2.6 -1.4 -2.6 1.4 .5 -3 -2.2 -2.1 3 -.4 Z');
    stroke(ctx, 'M35 17 Q33 17 33 15 Q33 13 35.2 13.3 Q36 11.5 38.5 11.5 Q41.5 11.5 42 13.5 Q45 13.5 45 15.5 Q45 17 43 17 Z');
  },
  diya(ctx) {
    stroke(ctx, 'M4 15 Q18 28 32 15 Z');
    stroke(ctx, 'M18 3 C21 7 21 10 18 12 C15 10 15 7 18 3 Z');
  },
  eid(ctx) {
    stroke(ctx, 'M16 4 A11 11 0 1 0 26 20 A9 9 0 1 1 16 4 Z');
    stroke(ctx, 'M23 7 l1.2 2.8 2.8 1.2 -2.8 1.2 -1.2 2.8 -1.2 -2.8 -2.8 -1.2 2.8 -1.2 Z');
  },
  holly(ctx) {
    stroke(ctx, 'M4 18 Q8 14 6 10 Q10 11 12 7 Q14 11 18 10 Q16 14 18 16 Q12 15 4 18 Z');
    stroke(ctx, 'M14 22 Q16 17 14 14 Q18 15 21 12 Q22 16 26 17 Q22 19 23 22 Q18 20 14 22 Z');
    dot(ctx, 17, 11, 1.5);
    dot(ctx, 20, 10, 1.5);
    dot(ctx, 18.5, 13, 1.5);
  },
  dogear(ctx) {
    stroke(ctx, 'M4 20 L20 4 L20 20 Z');
  },
};

// zone, viewBox [w, h], width, and offsets from the canvas edges.
const PLACEMENT = {
  blossom: { zone: 'top-right', vb: [40, 30], width: 0.22, top: 0.05, side: 0.05 },
  cloud: { zone: 'top-right', vb: [30, 30], width: 0.13, top: 0.0625, side: 0.06 },
  leaf: { zone: 'bottom-right', vb: [30, 30], width: 0.13, bottom: 0.0625, side: 0.06 },
  snowflake: { zone: 'top-center', vb: [30, 30], width: 0.13, top: 0.05 },
  rainier: { zone: 'bottom-right', vb: [64, 30], width: 0.3, bottom: 0.05, side: 0.05 },
  candle: { zone: 'top-center', vb: [30, 30], width: 0.13, top: 0.05 },
  rings: { zone: 'top-center', vb: [36, 24], width: 0.13, top: 0.05 },
  mobile: { zone: 'top-center', vb: [50, 30], width: 0.28, top: 0.0375 },
  diya: { zone: 'bottom-center', vb: [36, 26], width: 0.16, bottom: 0.05 },
  eid: { zone: 'top-right', vb: [30, 30], width: 0.13, top: 0.0625, side: 0.06 },
  holly: { zone: 'top-left', vb: [30, 30], width: 0.13, top: 0.0625, side: 0.06 },
  dogear: { zone: 'bottom-right', vb: [20, 20], width: 0.12, bottom: 0, side: 0 },
};

// The motif's bounding rectangle on a w x h canvas, in canvas units.
export function motifRect(p, w, h) {
  const width = p.width * w;
  const height = width * (p.vb[1] / p.vb[0]);
  let x = (w - width) / 2;
  if (p.zone.endsWith('right')) x = w - p.side * w - width;
  if (p.zone.endsWith('left')) x = p.side * w;
  const y = p.zone.startsWith('top') ? p.top * w : h - p.bottom * w - height;
  return { x, y, width, height };
}

function makeMotif(key) {
  const p = PLACEMENT[key];
  const extent = (p.zone.startsWith('top') ? p.top : p.bottom) + p.width * (p.vb[1] / p.vb[0]);
  return {
    zone: p.zone,
    // Measured from the margin inset, so the narrowest margin still clears the motif.
    height: Math.round((extent + GAP - MIN_MARGIN) * 10000) / 10000,
    placement: p,
    draw(ctx, { w, h, tint, variant }) {
      const r = motifRect(p, w, h);
      const s = r.width / p.vb[0];
      ctx.save();
      ctx.translate(r.x, r.y);
      ctx.scale(s, s);
      ctx.lineWidth = STROKE / s;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = tint;
      ctx.fillStyle = tint;
      PAINT[key](ctx, { variant });
      ctx.restore();
    },
  };
}

export const MOTIFS = Object.fromEntries(Object.keys(PLACEMENT).map((k) => [k, makeMotif(k)]));
