// Checks a theme file's spec and turns it into the theme object the app uses.
// Every theme in js/themes/ is a call to defineTheme, so a mistake in one fails
// `npm test` with a message naming the theme and the field.

import { contrastRatio } from './color.js';
import { compileMotif } from './motifs.js';

export const FONTS = {
  clean: { label: 'Clean', family: 'Hanken Grotesk', italic: false, light: 300, regular: 400 },
  classic: { label: 'Classic', family: 'EB Garamond', italic: false, light: 400, regular: 400 },
  'classic-italic': { label: 'Italic', family: 'EB Garamond', italic: true, light: 400, regular: 400 },
  hand: { label: 'Hand', family: 'Kalam', italic: false, light: 300, regular: 400 },
  typed: { label: 'Typed', family: 'Courier Prime', italic: false, light: 400, regular: 400 },
};

// Theme groups, in the order the Style sheet shows them as tabs.
export const GROUPS = {
  plain: 'Plain',
  seasons: 'Seasons',
  places: 'Places',
  occasions: 'Occasions',
};

// 'plain' means no texture of its own; turning texture on then gives grain.
export const TEXTURES = ['plain', 'grain', 'lined', 'laid'];

export const MIN_CONTRAST = 7;
const HEX = /^#[0-9A-Fa-f]{6}$/;
const ID = /^[a-z][a-z0-9-]*$/;

function fail(id, msg) {
  throw new Error(`Theme "${id}": ${msg}`);
}

function colours(id, which, c) {
  if (!c || typeof c !== 'object') fail(id, `${which} must be { ground, ink, tint }`);
  for (const k of ['ground', 'ink', 'tint']) {
    if (!HEX.test(c[k] ?? '')) fail(id, `${which}.${k} must be a #RRGGBB colour, got ${c[k]}`);
  }
  const ratio = contrastRatio(c.ground, c.ink);
  if (ratio < MIN_CONTRAST) {
    fail(id, `${which} ink on ground has contrast ${ratio.toFixed(2)}, needs at least ${MIN_CONTRAST}`);
  }
  return { ground: c.ground, ink: c.ink, tint: c.tint };
}

function range(id, field, value, lo, hi) {
  if (value === undefined) return undefined;
  if (typeof value !== 'number' || value < lo || value > hi) fail(id, `${field} must be a number from ${lo} to ${hi}`);
  return value;
}

export function defineTheme(spec) {
  const id = spec?.id;
  if (typeof id !== 'string' || !ID.test(id) || id.startsWith('mine-')) {
    fail(id, 'id must be lowercase letters, digits and dashes, and must not start with "mine-"');
  }
  if (typeof spec.name !== 'string' || !spec.name.trim()) fail(id, 'name is required');
  if (!(spec.group in GROUPS)) fail(id, `group must be one of ${Object.keys(GROUPS).join(', ')}`);
  if (!(spec.font in FONTS)) fail(id, `font must be one of ${Object.keys(FONTS).join(', ')}`);
  const texture = spec.texture ?? 'plain';
  if (!TEXTURES.includes(texture)) fail(id, `texture must be one of ${TEXTURES.join(', ')}`);

  const dark = colours(id, 'dark', spec.dark);
  const light = spec.light == null ? null : colours(id, 'light', spec.light);
  if (spec.group === 'plain' && light) fail(id, 'Plain themes have a single look, so light must be null');
  if (spec.group !== 'plain' && !light) fail(id, 'every theme outside Plain needs a light variant');

  const dot = spec.dot ?? 'tint';
  if (dot !== 'tint' && !HEX.test(dot)) fail(id, 'dot must be a #RRGGBB colour or "tint"');

  let motif = null;
  if (spec.motif) {
    try {
      motif = compileMotif(spec.motif);
    } catch (e) {
      fail(id, `motif: ${e.message}`);
    }
  }

  return {
    id,
    name: spec.name,
    group: spec.group,
    font: spec.font,
    texture,
    dark,
    light,
    dot: dot === 'tint' ? null : dot,
    motif,
    marginBoost: range(id, 'marginBoost', spec.marginBoost, 0, 0.1),
    capScale: range(id, 'capScale', spec.capScale, 0.5, 1.5),
  };
}
