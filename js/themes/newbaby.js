import { defineTheme } from '../theme-engine.js';

export default defineTheme({
  id: 'newbaby',
  name: 'New baby',
  group: 'occasions',
  font: 'hand',
  texture: 'plain',
  dark: { ground: '#1C1A1E', ink: '#F1ECE6', tint: '#C7B4D6' },
  light: { ground: '#FBF6EE', ink: '#35302C', tint: '#B79CC9' },
  motif: {
    zone: 'top-center', viewBox: [50, 30], width: 0.28, top: 0.0375,
    draw: [
      'M8 4 Q25 1 42 4',
      'M25 0.5 L25 2.6 M11 4 L11 15 M25 2.8 L25 19 M39 4 L39 12',
      'M13.5 17 A4 4 0 1 1 13.5 23 A3 3 0 1 0 13.5 17 Z',
      'M25 19.5 l1.3 2.7 3 .4 -2.2 2.1 .5 3 -2.6 -1.4 -2.6 1.4 .5 -3 -2.2 -2.1 3 -.4 Z',
      'M35 17 Q33 17 33 15 Q33 13 35.2 13.3 Q36 11.5 38.5 11.5 Q41.5 11.5 42 13.5 Q45 13.5 45 15.5 Q45 17 43 17 Z',
    ],
  },
});
