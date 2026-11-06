import { defineTheme } from '../theme-engine.js';

export default defineTheme({
  id: 'rainier',
  name: 'Rainier',
  group: 'places',
  font: 'clean',
  texture: 'grain',
  dark: { ground: '#121A1B', ink: '#E6ECE8', tint: '#8FA6A8' },
  light: { ground: '#EEF1EF', ink: '#1E2A28', tint: '#6F8B86' },
  motif: {
    zone: 'bottom-right', viewBox: [64, 30], width: 0.3, bottom: 0.05, side: 0.05,
    draw: [
      'M14 28 L28 13 L31 9 Q34 6 37 9 L44 15 L62 28',
      'M28 13 L30.5 14 L32.5 11.5 L34.5 13.5 L37 11 L39.5 13 L44 15',
      { d: 'M0.5 28 L63 28', alpha: 0.55 },
      'M4 28 L4 25.25 M0.48 25.25 L4 17 L7.52 25.25 Z M1.36 21.95 L4 17 L6.64 21.95',
      'M9 28 L9 25.875 M6.28 25.875 L9 19.5 L11.72 25.875 Z M6.96 23.325 L9 19.5 L11.04 23.325',
      'M13.2 28 L13.2 26.5 M11.28 26.5 L13.2 22 L15.12 26.5 Z M11.76 24.7 L13.2 22 L14.64 24.7',
    ],
  },
});
