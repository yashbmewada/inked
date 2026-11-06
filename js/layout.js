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

  for (const { segment: seg } of words.segment(p)) {
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
      if (line && measure(line + g) > maxWidth) flush();
      line += g;
    }
  }
  flush();
  return lines;
}
