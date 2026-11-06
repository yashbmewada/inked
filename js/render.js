import { fitText, paragraphDirection, sizeBand, SHAPES, LINE_HEIGHT, PARA_GAP, TITLE_BLOCK } from './layout.js';
import { FONTS, FALLBACK_STACK, MOTIFS } from './themes.js';
import { contrastRatio } from './color.js';
import { motifRect, STROKE } from './motifs.js';

// Distance from a line's vertical centre down to its alphabetic baseline, as a fraction of the font size.
const BASELINE_DROP = 0.32;
const RULE_DROP = 0.14;
const GRAIN_SEED = 1;
const LAID_PITCH = 24;

const FONT_LOADS = [
  ['Hanken Grotesk', 'normal', 300],
  ['Hanken Grotesk', 'normal', 400],
  ['EB Garamond', 'normal', 400],
  ['EB Garamond', 'italic', 400],
  ['Kalam', 'normal', 300],
  ['Kalam', 'normal', 400],
  ['Courier Prime', 'normal', 400],
];

let fontsSettled = false;

export function fontsReady() {
  return fontsSettled;
}

export async function loadFonts() {
  try {
    await Promise.all(
      FONT_LOADS.map(([family, style, weight]) =>
        document.fonts.load(`${style === 'italic' ? 'italic ' : ''}${weight} 16px "${family}"`),
      ),
    );
  } finally {
    fontsSettled = true;
  }
}

export function fontString(style, size, weight) {
  return `${style.italic ? 'italic ' : ''}${weight} ${size}px "${style.family}", ${FALLBACK_STACK}`;
}

export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// The text area: the margin inset on all sides, less the motif's reserved band.
export function safeBox(w, h, marginFrac, motif) {
  const m = marginFrac * w;
  const box = { x: m, y: m, width: w - 2 * m, height: h - 2 * m };
  if (motif) {
    const band = motif.height * w;
    if (motif.zone.startsWith('top')) box.y += band;
    box.height -= band;
  }
  return box;
}

// The signature dot: in the bottom margin at the first block's start edge. If that spot
// touches a bottom motif, it moves up into the gap between the text area and the motif.
export function dotPlacement(w, h, box, margin, size, rtl, motif) {
  const r = Math.min(22, Math.max(12, 0.3 * size)) / 2;
  const x = rtl ? box.x + box.width - r : box.x + r;
  let y = h - margin / 2;
  if (motif && motif.zone.startsWith('bottom')) {
    const m = motifRect(motif.placement, w, h);
    const pad = STROKE / 2;
    const hits = x + r > m.x - pad && x - r < m.x + m.width + pad && y + r > m.y - pad;
    if (hits) y = (box.y + box.height + m.y - pad) / 2;
  }
  return { x, y, r };
}

const variantOf = (ground) =>
  contrastRatio(ground, '#FFFFFF') > contrastRatio(ground, '#000000') ? 'dark' : 'light';

function fit(ctx, letter, style, box, weight) {
  const measureAt = (size) => {
    ctx.font = fontString(style, size, weight);
    return (s) => ctx.measureText(s).width;
  };
  return fitText({ title: letter.title, text: letter.text, box, cap: style.cap, measureAt });
}

// Baselines of every body line, top to bottom, in layout units.
function bodyBaselines(layout, box, hasTitle) {
  const { size, titleSize, blocks } = layout;
  const lh = size * LINE_HEIGHT;
  let y = box.y + (hasTitle ? TITLE_BLOCK * titleSize : 0);
  const out = [];
  blocks.forEach((b, i) => {
    if (i > 0) y += size * PARA_GAP;
    for (const line of b.lines) {
      out.push({ line, dir: b.dir, y: y + lh / 2 + size * BASELINE_DROP });
      y += lh;
    }
  });
  return out;
}

function drawGrain(ctx, w, h, ink) {
  const rand = mulberry32(GRAIN_SEED);
  const count = Math.round((w * h) / 40);
  ctx.save();
  ctx.fillStyle = ink;
  for (let i = 0; i < count; i++) {
    const x = rand() * w;
    const y = rand() * h;
    const s = 0.6 + rand() * 0.6;
    ctx.globalAlpha = 0.03 + rand() * 0.03;
    ctx.fillRect(x, y, s, s);
  }
  ctx.restore();
}

function drawLined(ctx, box, bottom, ink, baselines, size) {
  const pitch = size * LINE_HEIGHT;
  const ys = baselines.map((b) => b.y + size * RULE_DROP);
  let y = ys.length ? ys[ys.length - 1] + pitch : box.y + pitch / 2 + size * (BASELINE_DROP + RULE_DROP);
  for (; y <= bottom; y += pitch) ys.push(y);
  ctx.save();
  ctx.strokeStyle = ink;
  ctx.globalAlpha = 0.25;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (const ry of ys) {
    ctx.moveTo(box.x, ry);
    ctx.lineTo(box.x + box.width, ry);
  }
  ctx.stroke();
  ctx.restore();
}

function drawLaid(ctx, w, h, ink) {
  ctx.save();
  ctx.strokeStyle = ink;
  ctx.globalAlpha = 0.04;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = LAID_PITCH; x < w; x += LAID_PITCH) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
  }
  ctx.stroke();
  ctx.restore();
}

export function renderImage(canvas, letter, style, shape, scale) {
  const { w, h } = SHAPES[shape];
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(scale, scale);

  const motif = style.motif ? MOTIFS[style.motif] : null;
  const box = safeBox(w, h, style.marginFrac, motif);
  const margin = style.marginFrac * w;
  const title = (letter.title ?? '').trim();
  const empty = title === '' && (letter.text ?? '').trim() === '';

  let layout = null;
  let weight = FONTS[style.fontKey].light;
  if (!empty) {
    layout = fit(ctx, { title, text: letter.text ?? '' }, style, box, weight);
    if (sizeBand(layout.size) !== 'comfortable' && (style.fontKey === 'clean' || style.fontKey === 'hand')) {
      weight = FONTS[style.fontKey].regular;
      layout = fit(ctx, { title, text: letter.text ?? '' }, style, box, weight);
    }
  }
  const size = layout ? layout.size : style.cap;
  const baselines = layout ? bodyBaselines(layout, box, title !== '') : [];

  ctx.fillStyle = style.ground;
  ctx.fillRect(0, 0, w, h);

  if (style.texture === 'grain') drawGrain(ctx, w, h, style.ink);
  else if (style.texture === 'lined') drawLined(ctx, box, h - margin, style.ink, baselines, size);
  else if (style.texture === 'laid') drawLaid(ctx, w, h, style.ink);

  if (motif) motif.draw(ctx, { w, h, tint: style.tint, variant: variantOf(style.ground) });

  if (empty) return { size, band: sizeBand(size), empty: true };

  ctx.fillStyle = style.ink;
  ctx.textBaseline = 'alphabetic';

  if (title) {
    ctx.font = fontString(style, layout.titleSize, weight);
    ctx.direction = paragraphDirection(title);
    ctx.textAlign = 'center';
    const lh = layout.titleSize * LINE_HEIGHT;
    ctx.fillText(title, box.x + box.width / 2, box.y + lh / 2 + layout.titleSize * BASELINE_DROP);
  }

  ctx.font = fontString(style, size, weight);
  for (const b of baselines) {
    const rtl = b.dir === 'rtl';
    ctx.direction = rtl ? 'rtl' : 'ltr';
    ctx.textAlign = rtl ? 'right' : 'left';
    ctx.fillText(b.line, rtl ? box.x + box.width : box.x, b.y);
  }

  const startRtl = layout.blocks.length > 0 && layout.blocks[0].dir === 'rtl';
  const dot = dotPlacement(w, h, box, margin, size, startRtl, motif);
  ctx.fillStyle = style.dot;
  ctx.beginPath();
  ctx.arc(dot.x, dot.y, dot.r, 0, 2 * Math.PI);
  ctx.fill();

  return { size, band: sizeBand(size), empty: false };
}
