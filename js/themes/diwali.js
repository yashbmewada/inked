import { defineTheme } from '../theme-engine.js';

export default defineTheme({
  id: 'diwali',
  name: 'Diwali',
  group: 'occasions',
  font: 'classic',
  texture: 'grain',
  dark: { ground: '#1A1410', ink: '#F4E6CF', tint: '#E39B3B' },
  light: { ground: '#FAF1E2', ink: '#2E2115', tint: '#D2862A' },
  motif: {
    zone: 'bottom-center', viewBox: [36, 26], width: 0.16, bottom: 0.05,
    draw: [
      'M4 15 Q18 28 32 15 Z',
      'M18 3 C21 7 21 10 18 12 C15 10 15 7 18 3 Z',
    ],
  },
});
