// Usage: npm run new-theme -- <id> "<Name>" <group>
// Writes js/themes/<id>.js from a template and lists it in js/themes/index.js.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { GROUPS } from '../js/theme-engine.js';

const [id, name, group] = process.argv.slice(2);
const die = (msg) => {
  console.error(msg);
  process.exit(1);
};

if (!id || !name || !group) die('Usage: npm run new-theme -- <id> "<Name>" <group>');
if (!/^[a-z][a-z0-9-]*$/.test(id) || id.startsWith('mine-')) die('id must be lowercase letters, digits and dashes, not starting with "mine-"');
if (!(group in GROUPS)) die(`group must be one of ${Object.keys(GROUPS).join(', ')}`);

const root = new URL('../js/themes/', import.meta.url);
const file = new URL(`${id}.js`, root);
if (existsSync(file)) die(`js/themes/${id}.js already exists`);

const light = group === 'plain'
  ? 'null'
  : `{ ground: '#F4F1EA', ink: '#24221F', tint: '#8A7F6E' }`;

writeFileSync(file, `import { defineTheme } from '../theme-engine.js';

export default defineTheme({
  id: '${id}',
  name: '${name.replace(/'/g, "\\'")}',
  group: '${group}',
  // clean, classic, classic-italic, hand or typed. The user can still switch font.
  font: 'classic',
  // plain, grain, lined or laid: the paper used when the user turns texture on.
  texture: 'plain',
  // Ink on ground needs a contrast of at least 7. The tint colours the motif and the signature dot.
  dark: { ground: '#161513', ink: '#EEEAE2', tint: '#A89A82' },
  light: ${light},
  // Optional: dot: '#D0533A' for a fixed dot colour, marginBoost: 0.03, capScale: 0.85.
  // Optional motif, drawn in tint in its own viewBox and scaled to width (a fraction of the image width).
  // Delete the block for no motif. Each draw item is an SVG path string, or { d, alpha } or { d, fill: true }.
  motif: {
    zone: 'top-right', viewBox: [30, 30], width: 0.13, top: 0.06, side: 0.06,
    draw: [
      'M15 4 L26 15 L15 26 L4 15 Z',
    ],
  },
});
`);

const indexUrl = new URL('index.js', root);
const index = readFileSync(indexUrl, 'utf8');
const ident = id.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
const lastImport = index.lastIndexOf('\nimport ');
const importEnd = index.indexOf('\n', lastImport + 1);
const withImport = `${index.slice(0, importEnd)}\nimport ${ident} from './${id}.js';${index.slice(importEnd)}`;
writeFileSync(indexUrl, withImport.replace(/\n\];\s*$/, `\n  ${ident},\n];\n`));

console.log(`Created js/themes/${id}.js and listed it in js/themes/index.js.`);
console.log('Edit the colours and motif, open tests/visual.html to see it, then run npm test.');
