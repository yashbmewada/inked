import { defineTheme } from '../theme-engine.js';

export default defineTheme({
  id: 'winter',
  name: 'Winter',
  group: 'seasons',
  font: 'typed',
  texture: 'plain',
  dark: { ground: '#141A20', ink: '#E6ECF0', tint: '#7F93A3' },
  light: { ground: '#EEF1F3', ink: '#1F2A33', tint: '#8396A6' },
  motif: {
    zone: 'top-center', viewBox: [30, 30], width: 0.13, top: 0.05,
    // One arm, turned six times around the centre.
    paint(ctx) {
      for (let i = 0; i < 6; i++) {
        ctx.save();
        ctx.translate(15, 15);
        ctx.rotate((i * Math.PI) / 3);
        ctx.translate(-15, -15);
        ctx.stroke(new Path2D('M15 15 L15 4 M15 8 L12 5 M15 8 L18 5'));
        ctx.restore();
      }
    },
  },
});
