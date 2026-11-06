import { defineTheme } from '../theme-engine.js';

export default defineTheme({
  id: 'christmas',
  name: 'Christmas',
  group: 'occasions',
  font: 'classic',
  texture: 'grain',
  dark: { ground: '#14231C', ink: '#F1ECE2', tint: '#B8473A' },
  light: { ground: '#F4F0E8', ink: '#1B2A22', tint: '#B8473A' },
  motif: {
    zone: 'top-left', viewBox: [30, 30], width: 0.13, top: 0.0625, side: 0.06,
    draw: [
      'M4 18 Q8 14 6 10 Q10 11 12 7 Q14 11 18 10 Q16 14 18 16 Q12 15 4 18 Z',
      'M14 22 Q16 17 14 14 Q18 15 21 12 Q22 16 26 17 Q22 19 23 22 Q18 20 14 22 Z',
    ],
    // Berries.
    paint(ctx) {
      for (const [x, y] of [[17, 11], [20, 10], [18.5, 13]]) {
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, 2 * Math.PI);
        ctx.fill();
      }
    },
  },
});
