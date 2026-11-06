# Inked.

Inked. turns a letter into one themed image you can send in a chat app. Live at https://yashbmewada.github.io/inked/.

![Inked. on a phone, showing a short note on a cream theme](docs/screenshot.png)

Your words stay on this device. The site is static files, makes no network requests beyond its own, and has no analytics. The letter and your settings are kept in the browser's local storage, and the app works without it.

## Run locally

```
python3 -m http.server
```

Open http://localhost:8000/. Opening index.html straight from disk (`file://`) does not work for sharing, because browsers only expose the share sheet and the clipboard on secure origins, and localhost counts as one.

## Deploy with GitHub Pages

Push to GitHub, then go to Settings, then Pages, and deploy from the `main` branch at `/`. All asset paths are relative, so it works under `<user>.github.io/<repo>/`. The empty `.nojekyll` file makes Pages serve the files as they are.

## Tests

```
npm test
```

Needs Node 22 or later. There are no dependencies to install.

## Add a theme

```
npm run new-theme -- sea-glass "Sea glass" seasons
```

This writes `js/themes/sea-glass.js` from a commented template and lists it in `js/themes/index.js`. The group is one of `plain`, `seasons`, `places` or `occasions`. Edit the colours and the motif in the new file, open http://localhost:8000/tests/visual.html to see every theme rendered, then run `npm test`.

Each theme file is one `defineTheme({...})` call:

- `font`: `clean`, `classic`, `classic-italic`, `hand` or `typed`. People can still switch to any font.
- `texture`: `plain`, `grain`, `lined` or `laid`, used when people turn paper texture on.
- `dark` and `light`: `{ ground, ink, tint }` as `#RRGGBB`. Ink on ground needs a contrast ratio of at least 7. Plain themes have `light: null`; every other group needs both. The tint colours the motif and the signature dot.
- `dot` (optional): a fixed `#RRGGBB` for the signature dot instead of the tint.
- `marginBoost` and `capScale` (optional): extra margin as a fraction of the width, and a multiplier on the largest text size.
- `motif` (optional): a small drawing in the tint. `zone` is `top-` or `bottom-` followed by `left`, `center` or `right`. `viewBox` is `[width, height]`, `width` is a fraction of the image width (at most 0.4), and `top` or `bottom` plus `side` are offsets as fractions of the width. `draw` lists SVG path strings to stroke, or `{ d, alpha }` for a fainter stroke and `{ d, fill: true }` to fill. A drawing that paths cannot express can add `paint(ctx, { variant, tint })`; see `js/themes/spring.js`.

`defineTheme` rejects a mistake with a message naming the theme and the field, and the tests check that the motif never overlaps the text at any shape or margin. To add a group, add it to `GROUPS` in `js/theme-engine.js`.

## Fonts

Self-hosted, each under the SIL Open Font License 1.1. The licence text is next to each font in `fonts/`.

- Hanken Grotesk
- EB Garamond
- Kalam
- Courier Prime

## Licence

MIT. See LICENSE.
