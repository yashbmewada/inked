import { defineTheme } from '../theme-engine.js';

export default defineTheme({
  id: 'thankyou',
  name: 'Thank you',
  group: 'occasions',
  font: 'typed',
  texture: 'laid',
  dark: { ground: '#191A16', ink: '#ECEAE2', tint: '#8C9A76' },
  light: { ground: '#F2EEE6', ink: '#262420', tint: '#7E8C6A' },
  motif: {
    zone: 'bottom-right', viewBox: [20, 20], width: 0.12, bottom: 0, side: 0,
    draw: ['M4 20 L20 4 L20 20 Z'],
  },
});
