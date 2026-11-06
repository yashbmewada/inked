import { defineTheme } from '../theme-engine.js';

export default defineTheme({
  id: 'eid',
  name: 'Eid',
  group: 'occasions',
  font: 'classic',
  texture: 'plain',
  dark: { ground: '#0F1D24', ink: '#EDE7D9', tint: '#C9B27A' },
  light: { ground: '#F1EEE4', ink: '#16262E', tint: '#AA9259' },
  motif: {
    zone: 'top-right', viewBox: [30, 30], width: 0.13, top: 0.0625, side: 0.06,
    draw: [
      'M16 4 A11 11 0 1 0 26 20 A9 9 0 1 1 16 4 Z',
      'M23 7 l1.2 2.8 2.8 1.2 -2.8 1.2 -1.2 2.8 -1.2 -2.8 -2.8 -1.2 2.8 -1.2 Z',
    ],
  },
});
