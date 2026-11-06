import { defineTheme } from '../theme-engine.js';

const PINK = { light: '#E58FA2', dark: '#EBA0B1' };
const CENTRE = '#F3C969';

function blossom(ctx, cx, cy, r, colour) {
  const dist = r * 1.33;
  ctx.fillStyle = colour;
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    ctx.beginPath();
    ctx.arc(cx + dist * Math.cos(a), cy + dist * Math.sin(a), r, 0, 2 * Math.PI);
    ctx.fill();
  }
  ctx.fillStyle = CENTRE;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.6, 0, 2 * Math.PI);
  ctx.fill();
}

function leaf(ctx, cx, cy, rx, ry, deg) {
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, (deg * Math.PI) / 180, 0, 2 * Math.PI);
  ctx.stroke();
}

export default defineTheme({
  id: 'spring',
  name: 'Spring',
  group: 'seasons',
  font: 'classic',
  dark: { ground: '#17201A', ink: '#EEF2E6', tint: '#93BC7F' },
  light: { ground: '#F5F3E6', ink: '#26301F', tint: '#6E9A5B' },
  motif: {
    zone: 'top-right', viewBox: [40, 30], width: 0.22, top: 0.05, side: 0.05,
    draw: [
      'M4 27 Q16 20 24 12 Q29 7 36 4',
      'M16 19 Q15 14 18 11',
      'M26 10.5 Q30 12 33 10',
    ],
    // Blossoms are filled pink on either variant, so they are painted by hand.
    paint(ctx, { variant }) {
      leaf(ctx, 11, 21, 3.6, 1.6, -50);
      leaf(ctx, 29, 7, 3.2, 1.4, 25);
      const pink = PINK[variant] ?? PINK.dark;
      blossom(ctx, 18, 11, 1.42, pink);
      blossom(ctx, 33, 10, 1.2, pink);
      blossom(ctx, 36, 4, 0.98, pink);
      blossom(ctx, 22, 15.5, 0.9, pink);
    },
  },
});
