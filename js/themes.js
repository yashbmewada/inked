import { MARGINS, SIZE_CAPS } from './layout.js';
import { FONTS, GROUPS } from './theme-engine.js';
import ALL from './themes/index.js';

export { FONTS, GROUPS };

export const FALLBACK_STACK = 'system-ui, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';

// Grouped in GROUPS order, so a theme file's place in index.js only orders it within its group.
export const THEMES = Object.keys(GROUPS).flatMap((g) => ALL.filter((t) => t.group === g));

const seen = new Set();
for (const t of THEMES) {
  if (seen.has(t.id)) throw new Error(`Theme "${t.id}" is listed twice in js/themes/index.js`);
  seen.add(t.id);
}

// Compiled motifs keyed by theme id; a resolved style names its motif by that id.
export const MOTIFS = Object.fromEntries(THEMES.filter((t) => t.motif).map((t) => [t.id, t.motif]));

export function getTheme(id) {
  return THEMES.find((t) => t.id === id);
}

function themeForState(state) {
  let id = state.themeId;
  if (id.startsWith('mine-')) {
    const saved = (state.myThemes || []).find((m) => m.id === id);
    id = saved ? saved.baseThemeId : 'night';
  }
  return getTheme(id) || getTheme('night');
}

export function resolveStyle(state, prefersDark) {
  const theme = themeForState(state);
  const wanted = state.variant ?? (prefersDark ? 'dark' : 'light');
  const colours = (wanted === 'light' && theme.light) || theme.dark;
  const fontKey = state.font === 'theme' ? theme.font : state.font;
  const font = FONTS[fontKey];
  let texture = 'none';
  if (state.textureOn) {
    const choice = state.textureChoice ?? theme.texture;
    texture = choice === 'plain' ? 'grain' : choice;
  }
  return {
    ground: colours.ground,
    ink: colours.ink,
    tint: colours.tint,
    dot: theme.dot ?? colours.tint,
    fontKey,
    family: font.family,
    italic: font.italic,
    texture,
    motif: theme.motif ? theme.id : null,
    marginFrac: MARGINS[state.margins] + (theme.marginBoost ?? 0),
    cap: SIZE_CAPS[state.textSize] * (theme.capScale ?? 1),
  };
}
