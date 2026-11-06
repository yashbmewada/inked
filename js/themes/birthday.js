import { defineTheme } from '../theme-engine.js';

export default defineTheme({
  id: 'birthday',
  name: 'Birthday',
  group: 'occasions',
  font: 'hand',
  texture: 'plain',
  dark: { ground: '#1A1614', ink: '#F3EBDF', tint: '#D0533A' },
  light: { ground: '#F6EFE4', ink: '#2A2522', tint: '#D0533A' },
  motif: {
    zone: 'top-center', viewBox: [30, 30], width: 0.13, top: 0.05,
    draw: [
      'M12 13 L18 13 L18 28 L12 28 Z',
      'M15 3 C18 7 18 10 15 11 C12 10 12 7 15 3 Z',
    ],
  },
});
