import { defineTheme } from '../theme-engine.js';

export default defineTheme({
  id: 'autumn',
  name: 'Autumn',
  group: 'seasons',
  font: 'classic',
  texture: 'grain',
  dark: { ground: '#2A1F18', ink: '#F0E4D4', tint: '#B5683A' },
  light: { ground: '#F4EADF', ink: '#2E2119', tint: '#B5683A' },
  motif: {
    zone: 'bottom-right', viewBox: [30, 30], width: 0.13, bottom: 0.0625, side: 0.06,
    draw: ['M6 24 C6 12 14 6 24 6 C24 16 18 24 6 24 Z M6 24 L18 12'],
  },
});
