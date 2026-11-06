import { defineTheme } from '../theme-engine.js';

export default defineTheme({
  id: 'sympathy',
  name: 'Sympathy',
  group: 'occasions',
  font: 'classic',
  texture: 'plain',
  dark: { ground: '#161616', ink: '#D9D6D0', tint: '#5A5854' },
  light: { ground: '#EFEEEB', ink: '#2B2A28', tint: '#A3A09A' },
  // No motif, wider margins and a smaller text cap, for a quieter page.
  marginBoost: 0.03,
  capScale: 0.85,
});
