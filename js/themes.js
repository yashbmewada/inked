import { MARGINS, SIZE_CAPS } from './layout.js';

export const FONTS = {
  clean: { family: 'Hanken Grotesk', italic: false, light: 300, regular: 400 },
  classic: { family: 'EB Garamond', italic: false, light: 400, regular: 400 },
  'classic-italic': { family: 'EB Garamond', italic: true, light: 400, regular: 400 },
  hand: { family: 'Kalam', italic: false, light: 300, regular: 400 },
  typed: { family: 'Courier Prime', italic: false, light: 400, regular: 400 },
};

export const FALLBACK_STACK = 'system-ui, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';

const v = (ground, ink, tint) => ({ ground, ink, tint });

const plain = (id, name, ground, ink) => ({
  id, name, group: 'plain', font: 'clean', texture: 'plain', motif: null,
  dark: v(ground, ink, ink), light: null, dot: '#D0533A',
});

export const THEMES = [
  plain('night', 'Night', '#0E0E0D', '#EDEAE3'),
  plain('cream', 'Cream', '#F3EEE3', '#2A2622'),
  plain('blush', 'Blush', '#F2E4DF', '#3A2A28'),
  plain('sage', 'Sage', '#E3E8DE', '#27301F'),
  plain('inkblue', 'Ink blue', '#18233A', '#E6E3DA'),
  { id: 'spring', name: 'Spring', group: 'seasons', font: 'classic', texture: 'plain', motif: 'blossom',
    dark: v('#17201A', '#EEF2E6', '#93BC7F'), light: v('#F5F3E6', '#26301F', '#6E9A5B') },
  { id: 'monsoon', name: 'Monsoon', group: 'seasons', font: 'clean', texture: 'grain', motif: 'cloud',
    dark: v('#142024', '#E3ECEA', '#7FA3A0'), light: v('#E8EFEE', '#1B2A2C', '#5F8D8A') },
  { id: 'autumn', name: 'Autumn', group: 'seasons', font: 'classic', texture: 'grain', motif: 'leaf',
    dark: v('#2A1F18', '#F0E4D4', '#B5683A'), light: v('#F4EADF', '#2E2119', '#B5683A') },
  { id: 'winter', name: 'Winter', group: 'seasons', font: 'typed', texture: 'plain', motif: 'snowflake',
    dark: v('#141A20', '#E6ECF0', '#7F93A3'), light: v('#EEF1F3', '#1F2A33', '#8396A6') },
  { id: 'rainier', name: 'Rainier', group: 'places', font: 'clean', texture: 'grain', motif: 'rainier',
    dark: v('#121A1B', '#E6ECE8', '#8FA6A8'), light: v('#EEF1EF', '#1E2A28', '#6F8B86') },
  { id: 'birthday', name: 'Birthday', group: 'occasions', font: 'hand', texture: 'plain', motif: 'candle',
    dark: v('#1A1614', '#F3EBDF', '#D0533A'), light: v('#F6EFE4', '#2A2522', '#D0533A') },
  { id: 'anniversary', name: 'Anniversary', group: 'occasions', font: 'classic-italic', texture: 'plain', motif: 'rings',
    dark: v('#121212', '#EDE6D8', '#B89A6A'), light: v('#F5F0E6', '#2A241C', '#A88A5A') },
  { id: 'newbaby', name: 'New baby', group: 'occasions', font: 'hand', texture: 'plain', motif: 'mobile',
    dark: v('#1C1A1E', '#F1ECE6', '#C7B4D6'), light: v('#FBF6EE', '#35302C', '#B79CC9') },
  { id: 'diwali', name: 'Diwali', group: 'occasions', font: 'classic', texture: 'grain', motif: 'diya',
    dark: v('#1A1410', '#F4E6CF', '#E39B3B'), light: v('#FAF1E2', '#2E2115', '#D2862A') },
  { id: 'eid', name: 'Eid', group: 'occasions', font: 'classic', texture: 'plain', motif: 'eid',
    dark: v('#0F1D24', '#EDE7D9', '#C9B27A'), light: v('#F1EEE4', '#16262E', '#AA9259') },
  { id: 'christmas', name: 'Christmas', group: 'occasions', font: 'classic', texture: 'grain', motif: 'holly',
    dark: v('#14231C', '#F1ECE2', '#B8473A'), light: v('#F4F0E8', '#1B2A22', '#B8473A') },
  { id: 'thankyou', name: 'Thank you', group: 'occasions', font: 'typed', texture: 'laid', motif: 'dogear',
    dark: v('#191A16', '#ECEAE2', '#8C9A76'), light: v('#F2EEE6', '#262420', '#7E8C6A') },
  { id: 'sympathy', name: 'Sympathy', group: 'occasions', font: 'classic', texture: 'plain', motif: null,
    dark: v('#161616', '#D9D6D0', '#5A5854'), light: v('#EFEEEB', '#2B2A28', '#A3A09A'),
    marginBoost: 0.03, capScale: 0.85 },
];

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
    motif: theme.motif,
    marginFrac: MARGINS[state.margins] + (theme.marginBoost ?? 0),
    cap: SIZE_CAPS[state.textSize] * (theme.capScale ?? 1),
  };
}
