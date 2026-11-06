import { defineTheme } from '../theme-engine.js';

export default defineTheme({
  id: 'anniversary',
  name: 'Anniversary',
  group: 'occasions',
  font: 'classic-italic',
  texture: 'plain',
  dark: { ground: '#121212', ink: '#EDE6D8', tint: '#B89A6A' },
  light: { ground: '#F5F0E6', ink: '#2A241C', tint: '#A88A5A' },
  motif: {
    zone: 'top-center', viewBox: [36, 24], width: 0.13, top: 0.05,
    draw: [
      'M21 12 A8 8 0 1 1 5 12 A8 8 0 1 1 21 12 Z',
      'M31 12 A8 8 0 1 1 15 12 A8 8 0 1 1 31 12 Z',
    ],
  },
});
