import { THEMES, FONTS } from './themes.js';

export const DEFAULT_STATE = {
  text: '',
  title: '',
  shape: 'portrait',
  themeId: 'night',
  variant: null,
  font: 'theme',
  textSize: 'medium',
  margins: 'normal',
  textureOn: false,
  textureChoice: null,
  caption: false,
  myThemes: [],
};

export const STORAGE_KEY = 'inked.v1';

const ENUMS = {
  shape: ['portrait', 'square', 'story'],
  font: ['theme', ...Object.keys(FONTS)],
  textSize: ['small', 'medium', 'large'],
  margins: ['narrow', 'normal', 'wide'],
};
const VARIANTS = [null, 'dark', 'light'];
const TEXTURES = [null, 'grain', 'lined', 'laid'];

const isMyTheme = (t) =>
  t && typeof t === 'object' &&
  typeof t.id === 'string' && t.id.startsWith('mine-') &&
  typeof t.name === 'string' &&
  THEMES.some((b) => b.id === t.baseThemeId) &&
  ENUMS.font.includes(t.font) &&
  VARIANTS.includes(t.variant) &&
  typeof t.textureOn === 'boolean' &&
  TEXTURES.includes(t.textureChoice) &&
  ENUMS.textSize.includes(t.textSize) &&
  ENUMS.margins.includes(t.margins);

const pickMyTheme = (t) => ({
  id: t.id, name: t.name, baseThemeId: t.baseThemeId, font: t.font, variant: t.variant,
  textureOn: t.textureOn, textureChoice: t.textureChoice, textSize: t.textSize, margins: t.margins,
});

export function loadState(storage) {
  try {
    const raw = storage && storage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_STATE);
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object' || Array.isArray(data)) return structuredClone(DEFAULT_STATE);
    const s = structuredClone(DEFAULT_STATE);
    for (const [k, list] of Object.entries(ENUMS)) if (list.includes(data[k])) s[k] = data[k];
    if (VARIANTS.includes(data.variant)) s.variant = data.variant;
    if (TEXTURES.includes(data.textureChoice)) s.textureChoice = data.textureChoice;
    for (const k of ['textureOn', 'caption']) if (typeof data[k] === 'boolean') s[k] = data[k];
    for (const k of ['text', 'title']) if (typeof data[k] === 'string') s[k] = data[k];
    if (Array.isArray(data.myThemes)) s.myThemes = data.myThemes.filter(isMyTheme).map(pickMyTheme);
    if (typeof data.themeId === 'string' &&
        (THEMES.some((t) => t.id === data.themeId) || s.myThemes.some((t) => t.id === data.themeId))) {
      s.themeId = data.themeId;
    }
    return s;
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}

export function saveState(state, storage) {
  try {
    if (storage) storage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage unavailable or full: the app keeps working in memory
  }
}

export function setTheme(state, themeId) {
  const mine = themeId.startsWith('mine-') && state.myThemes.find((t) => t.id === themeId);
  if (!mine) return { ...state, themeId };
  const { font, variant, textureOn, textureChoice, textSize, margins } = mine;
  return { ...state, themeId, font, variant, textureOn, textureChoice, textSize, margins };
}

export function saveMyTheme(state, name) {
  const current = state.myThemes.find((t) => t.id === state.themeId);
  const baseThemeId = current ? current.baseThemeId : state.themeId;
  let n = Date.now();
  while (state.myThemes.some((t) => t.id === 'mine-' + n)) n += 1;
  const { font, variant, textureOn, textureChoice, textSize, margins } = state;
  const entry = { id: 'mine-' + n, name, baseThemeId, font, variant, textureOn, textureChoice, textSize, margins };
  return { ...state, myThemes: [...state.myThemes, entry] };
}

export function removeMyTheme(state, id) {
  const target = state.myThemes.find((t) => t.id === id);
  const myThemes = state.myThemes.filter((t) => t.id !== id);
  const themeId = target && state.themeId === id ? target.baseThemeId : state.themeId;
  return { ...state, myThemes, themeId };
}

export function clearLetter(state) {
  return { ...state, text: '', title: '' };
}
