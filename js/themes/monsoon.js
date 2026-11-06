import { defineTheme } from '../theme-engine.js';

export default defineTheme({
  id: 'monsoon',
  name: 'Monsoon',
  group: 'seasons',
  font: 'clean',
  texture: 'grain',
  dark: { ground: '#142024', ink: '#E3ECEA', tint: '#7FA3A0' },
  light: { ground: '#E8EFEE', ink: '#1B2A2C', tint: '#5F8D8A' },
  motif: {
    zone: 'top-right', viewBox: [30, 30], width: 0.13, top: 0.0625, side: 0.06,
    draw: [
      'M8 16 Q4 16 4 12.5 Q4 9 8 9.5 Q9 5 13.5 5 Q18 5 19 9 Q24 8.5 24.5 12.5 Q25 16 21 16 Z',
      'M9 19.5 L8 22.5 M14 19 L12.6 23.5 M19.5 19.5 L18.5 22.5 M11.3 25.5 L10.8 27.5 M16.8 25.5 L16.2 28',
    ],
  },
});
