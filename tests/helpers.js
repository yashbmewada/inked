const seg = new Intl.Segmenter(undefined, { granularity: 'grapheme' });

export function fakeMeasure(size) {
  return (s) => [...seg.segment(s)].length * size * 0.5;
}
