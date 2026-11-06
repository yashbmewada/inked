import { defineTheme } from '../theme-engine.js';

export default defineTheme({
  id: 'night',
  name: 'Night',
  group: 'plain',
  font: 'clean',
  dark: { ground: '#0E0E0D', ink: '#EDEAE3', tint: '#EDEAE3' },
  light: null,
  dot: '#D0533A',
});
