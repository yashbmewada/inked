const RTL = /[֐-ࣿיִ-﷿ﹰ-﻿]/;
const LTR_LETTER = /\p{L}/u;

export function splitParagraphs(text) {
  return text
    .replace(/\r\n?/g, '\n')
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, ' ').trim())
    .filter(Boolean);
}

export function paragraphDirection(p) {
  for (const ch of p) {
    if (RTL.test(ch)) return 'rtl';
    if (LTR_LETTER.test(ch)) return 'ltr';
  }
  return 'ltr';
}

const PUNCT = /^\p{P}/u;

// Word segments, with each punctuation or symbol run attached to the segment before it.
function tokens(p, words) {
  const out = [];
  for (const { segment, isWordLike } of words.segment(p)) {
    const prev = out[out.length - 1];
    if (!isWordLike && segment.trim() && prev !== undefined && prev.trim()) out[out.length - 1] += segment;
    else out.push(segment);
  }
  return out;
}

export function wrapParagraph(p, maxWidth, measure) {
  const words = new Intl.Segmenter(undefined, { granularity: 'word' });
  const graphemes = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
  const lines = [];
  let line = '';

  const flush = () => {
    const t = line.trim();
    if (t) lines.push(t);
    line = '';
  };

  for (const seg of tokens(p, words)) {
    const blank = !seg.trim();
    if (measure(line + seg) <= maxWidth) {
      if (!(blank && !line)) line += seg;
      continue;
    }
    flush();
    if (blank) continue;
    if (measure(seg) <= maxWidth) {
      line = seg;
      continue;
    }
    for (const { segment: g } of graphemes.segment(seg)) {
      if (line && measure(line + g) > maxWidth) {
        // Carry the last grapheme down so punctuation never starts a line.
        const parts = PUNCT.test(g) ? [...graphemes.segment(line)].map((x) => x.segment) : [];
        if (parts.length > 1) {
          line = parts.slice(0, -1).join('');
          flush();
          line = parts[parts.length - 1];
        } else flush();
      }
      line += g;
    }
  }
  flush();
  return lines;
}

export const SHAPES = {
  portrait: { w: 1080, h: 1350, scale: 3 },
  square: { w: 1080, h: 1080, scale: 3 },
  story: { w: 1080, h: 1920, scale: 2.75 },
};
export const SIZE_CAPS = { small: 44, medium: 64, large: 88 };
export const MARGINS = { narrow: 0.07, normal: 0.11, wide: 0.15 };

export const LINE_HEIGHT = 1.5;
export const PARA_GAP = 1.33;
export const TITLE_SCALE = 1.2;
export const TITLE_BLOCK = 2;

const MIN_SIZE = 4;
const STEP = 0.5;

export function sizeBand(size) {
  if (size >= 45) return 'comfortable';
  if (size >= 30) return 'small';
  return 'tiny';
}

export function fitText({ title = '', text, box, cap, measureAt, measureTitleAt }) {
  const paragraphs = splitParagraphs(text);
  const hasTitle = title.trim() !== '';
  const titleMeasureAt = measureTitleAt ?? measureAt;

  const layout = (size) => {
    const titleSize = size * TITLE_SCALE;
    const measure = measureAt(size);
    const blocks = paragraphs.map((p) => ({
      dir: paragraphDirection(p),
      lines: wrapParagraph(p, box.width, measure),
    }));
    const lineCount = blocks.reduce((n, b) => n + b.lines.length, 0);
    const height =
      (hasTitle ? TITLE_BLOCK * titleSize : 0) +
      lineCount * size * LINE_HEIGHT +
      Math.max(0, blocks.length - 1) * size * PARA_GAP;
    const titleFits = !hasTitle || titleMeasureAt(titleSize)(title.trim()) <= box.width;
    return { size, titleSize, blocks, height, fits: titleFits && height <= box.height };
  };

  const top = Math.max(cap, MIN_SIZE);
  let chosen = top;
  if (!layout(top).fits) {
    let lo = 0;
    let hi = Math.ceil((top - MIN_SIZE) / STEP) - 1;
    let best = 0;
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (layout(MIN_SIZE + mid * STEP).fits) {
        best = mid;
        lo = mid + 1;
      } else hi = mid - 1;
    }
    chosen = MIN_SIZE + best * STEP;
  }
  const { fits, ...result } = layout(chosen);
  return result;
}
