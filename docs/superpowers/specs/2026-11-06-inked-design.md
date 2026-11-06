# Inked. design

Inked. turns a personal letter into one image that someone sends to one person in a chat app. It replaces the current single-page image generator in this repo (`index.html`, `script.js`, `styles.css`, `gen_image.sh`).

Mockups live in `docs/superpowers/specs/2026-11-06-inked-mockups/`:
- `app-ui.html`: app screens. Use the dark Clean phone screens, the light variant, the glass Style sheet and the desktop layout.
- `themes.html`: every theme in dark and light. New baby in this file is outdated; use `new-baby.html`.
- `new-baby.html`: the chosen New baby theme is "mobile", the first pair.

The mockups are static HTML. Grain in them is a CSS dot grid and does not represent the final texture.

## Intent

Someone writes a personal letter, turns it into an image, and sends it to one person in a chat app. Inked. makes that flow work for anyone, on a phone, with no setup. The open-source tool should feel calm and personal. It runs entirely in the browser, and nothing the user writes leaves their device until they share it.

Success: a person pastes a letter on their phone and sends a good-looking image in three taps (paste, Done, Share).

### Goals

- One image per letter, auto-fitted, readable in a chat app.
- Usable one-handed on a phone. Works on desktop.
- Themes for seasons, places and occasions, each with a dark and a light version.
- Hostable as a static site on GitHub Pages with no build step.

### Non-goals

- Splitting a letter across several images. The output is always one image.
- Uploading photos or custom backgrounds.
- Accounts, sync, analytics, notifications, streaks or any engagement mechanics.
- Installable app (PWA) or offline mode.
- Free sliders for text size or margins. Both come as three presets that work with auto-fit.

### Anti-goals

- Anything that feels pushy or gamified. The content is often intimate.
- An app that looks like an Apple imitation. Glass appears in one place only.
- Sending text off the device for any reason.

## Constraints

- Static files only: HTML, CSS and vanilla JavaScript. No framework, bundler or package install needed to run or deploy.
- All asset paths relative, so the site works at `<user>.github.io/<repo>/`.
- Fonts self-hosted in the repo, open-licensed (OFL), with their licence files.
- Web Share and clipboard image copy need HTTPS. GitHub Pages provides it. Local testing uses a local server (`python3 -m http.server`), not `file://`.
- iOS Safari refuses canvases over about 16.7 million pixels. Every export size stays under that.
- Mid-range Android phones must stay responsive while typing and restyling.

## Brand

- Name: **Inked.**
- Wordmark: "Inked" in Hanken Grotesk 300, sentence case, followed by a solid round vermilion dot `#D0533A` as the full stop, sized at about 1.3x a normal period.
- App icon: the vermilion dot alone on `#0E0E0D`, with no glass effect.
- Signature: every exported image carries a small solid dot in the bottom margin, aligned to the left edge of the text block, 0.18x the text cap height. It is vermilion on core colours, the theme's tint on themes, and grey on Sympathy. There is no watermark text.
- Brand line: "Inked. looks like a good correspondence card: warm off-black or cream, one fine line, one light typeface, and a single red full stop."

## App UI

The direction is "Clean": dark, 1px hairlines, softly rounded corners, a solid bottom bar, and glass on the Style sheet only.

### Tokens

| Token | Dark (default) | Light |
|---|---|---|
| ground | `#0E0E0D` | `#F3EEE3` |
| raised | `#171716` | `#ECE6D9` |
| ink | `#EDEAE3` | `#2A2622` |
| muted | `#8A877F` | `#7D7466` |
| hairline | `#2A2927` | `#D9D1C2` |
| tonal fill | `#22211F` | `#E8E1D3` |
| seal | `#D0533A` | `#D0533A` |

- The app follows the device's `prefers-color-scheme`, with no in-app toggle for the app chrome.
- Typeface: Hanken Grotesk only. Text input uses 300 at 18/28, body 400 at 15/22, labels 500 at 12/16, and the wordmark 300 at 22px.
- Spacing: 4px base, using steps of 8, 16, 24 and 40. The side gutter is 20px.
- Radii: 12px for every control and button, 8px for the letter preview, and 22px for the Style sheet's top corners.
- Borders are 1px hairline. There are no drop shadows.
- Share is the only ink-filled control. Save is outlined. Selected chips and the active shape segment use the tonal fill.
- Vermilion appears only on the wordmark dot, the selected-chip marker dot and the image signature. Never on a button.
- Motion: opacity plus a 4px translate, 180ms ease-out. The Style sheet slides up. No bounce, no scaling, and no animation of the text fitting. Under `prefers-reduced-motion`, changes are instant or use a 150ms fade.
- Tap targets are at least 44px. Buttons are 48px tall and chips 36px.

### Glass (Style sheet only)

```css
background: rgba(23,23,22,.72) linear-gradient(180deg, rgba(237,234,227,.06), transparent 45%);
backdrop-filter: blur(16px) saturate(140%);   /* plus -webkit- prefix */
border: 1px solid rgba(237,234,227,.10);
box-shadow: inset 0 1px 0 rgba(237,234,227,.16), inset 0 -1px 0 rgba(0,0,0,.35);
```

In the light app, the glass base is `rgba(243,238,227,.72)`.

Fallbacks:
- No `backdrop-filter` support: opaque `raised`.
- `prefers-reduced-transparency: reduce`: opaque `raised`, no blur.
- `prefers-contrast: more`: opaque `ground` with a 1px ink border, and muted text raised to ink.
- `forced-colors: active`: system colours and no blur.

Never animate the blur.

### Phone screens

**Home**
- From top to bottom: wordmark, framed letter preview at the chosen shape, a row with the shape segmented control (Portrait, Story, Square) and a round Style icon button, then a solid bottom bar with Save (outlined) and Share (filled, wider).
- First visit: the preview shows the empty theme with the grey prompt "Tap to write." Save and Share stay disabled until there is text.
- Tapping the preview opens the editor with the cursor at the end of the text. Tapping the title area on the preview opens the editor with the cursor in the title field.
- When the fitted text size is Small or Tiny and the shape is not Story, a line under the preview reads "Text is small. Try Story". "Try Story" switches the shape.
- "Also send the words as text" is a checkbox, off by default. It appears only when the device supports sharing files. When it is on, Share passes the letter in the share `text` field.

**Editor (full screen, solid, no glass)**
- Top row: wordmark (muted) on the left and Clear on the right. Clear needs two taps: the first tap turns the label into red "Clear all?" (`#ff453a`) for 3 seconds, and a second tap within that time clears the text, title and draft. There is no modal.
- A single-line "Title (optional)" field at 17px with a hairline under it.
- The body textarea fills the rest. Placeholder: "Write or paste your letter." followed by "Your words stay on this device."
- A bar pinned above the keyboard, positioned with `visualViewport`, shows the text size on the left ("Text size: comfortable", "small" or "tiny") and Done on the right.
- The Android back button acts as Done (use `history.pushState` when the editor opens).

**Style sheet (glass, slides up over the dimmed preview)**
- The letter stays visible and dimmed behind it, and each change redraws the preview straight away.
- Contents, top to bottom:
  - theme thumbnail strip, with group tabs Plain, Seasons, Places, Occasions and Mine
  - the selected theme's name and its font and paper below the strip
  - a Dark/Light switch for the image (hidden for the Plain group)
  - Font chips: Theme, Clean, Classic, Hand, Typed
  - Text size chips: Small, Medium, Large
  - Margin chips: Narrow, Normal, Wide
  - a Paper texture switch, and its choices when on
  - a "Save as my theme" link
- There is no "Themes" heading.
- The bottom bar hides while the sheet is open.

### Desktop (900px wide and up)

- Two columns. The preview is on the left. The right column holds the wordmark with Clear, a title input, an inline textarea, the shape control, the theme strip with the style rows inline (no sheet), the caption checkbox, and the buttons.
- Buttons: when `navigator.canShare({files})` is true, Share is primary, with Copy image and Save as secondary. Otherwise Copy image is primary next to Save.
- The preview redraws as the user types, debounced at about 150ms.

## The image

- **Sizes.** Layout uses a 1080-wide coordinate space. Export is at 3x for Portrait 4:5 (3240x4050) and Square (3240x3240), and 2.75x for Story 9:16 (2970x5280), which keeps every canvas under the iOS limit. Format is PNG.
- **Drawing order.** Ground colour, paper texture (if on), motif, title, body text, signature dot.
- **Safe area.** The text block sits inside a margin on all sides set by the Margins preset: Narrow 7%, Normal 11% (default) or Wide 15% of the width. Sympathy adds 3 percentage points to whichever preset is chosen. The theme's motif zone is reserved and excluded from the text area, so text never runs under or between motif strokes.
- **Text.** Left-aligned paragraphs, line height 1.5x, paragraph gap 1.33x the font size. Paragraphs split on blank lines. Line breaking follows the rules in Languages and emoji below. The optional title is centred, 1.2x the body size, with a gap of 2x the title size above the body.
- **Auto-fit.** Use the largest body size, up to the Text size preset's cap, at which the title and body fit the safe area. The caps in layout units are Small 44px, Medium 64px (default) and Large 88px. There is no minimum. A very long letter keeps shrinking so it always fits on one image, whatever preset is chosen. Sympathy's cap is 15% lower.
- **Size readout.** In layout units: Comfortable at 45px and above, Small from 30 to 45px, Tiny below 30px. The readout and the "Try Story" hint use these bands.
- **Weight.** The Clean and Hand fonts switch from weight 300 to 400 when the fitted size is Small or Tiny, so thin strokes survive chat-app compression.
- **No effects on the export.** No glass and no blur.

## Languages and emoji

Letters can be in any language and can contain emoji. The mockup `languages.html` shows Hindi, Arabic, Japanese and a mix with emoji.

- **Font stack on the canvas:** the theme font first, then `system-ui`, `"Apple Color Emoji"`, `"Segoe UI Emoji"`, `"Noto Color Emoji"`, `sans-serif`. Latin text uses the theme font. Other scripts and emoji fall back to the device's own fonts. Kalam (Hand) covers Devanagari as well. The self-hosted fonts can be Latin-only subsets plus Kalam's Devanagari.
- **Line breaking:** use `Intl.Segmenter` with word granularity, so Chinese, Japanese and Thai wrap without spaces. Never break inside a grapheme cluster (emoji with joiners, skin tones and flags, Devanagari conjuncts). If a single word is wider than the line, break it at grapheme boundaries.
- **Direction:** each paragraph's direction comes from its first strong character. Right-to-left paragraphs (Arabic, Hebrew, Urdu, Persian and others) are drawn with `ctx.direction = 'rtl'` and right-aligned to the right margin. The title stays centred. The signature dot sits at the start edge of the first paragraph: right for right-to-left.
- **Editor:** the title field and textarea use `dir="auto"`.
- **Emoji:** drawn in colour by the system emoji font. Emoji are not tinted to the theme ink.
- **Tests:** include Hindi, Arabic, Japanese, a ZWJ family emoji and a flag in the layout tests.

## Style system

### Fonts

| Name | Font | Weights |
|---|---|---|
| Clean (default) | Hanken Grotesk | 300 and 400 |
| Classic | EB Garamond | regular and italic |
| Hand | Kalam | 300 and 400 |
| Typed | Courier Prime | regular |

Wait for each font to load (`document.fonts.load`) before drawing.

### How the choices combine

Everything the user picks starts from a theme. There is no separate colour control.

- **Theme:** sets ground, ink, tint, motif, margins and size cap, a default font and a suggested texture.
- **Font chip:** chips are Theme, Clean, Classic, Hand and Typed. Theme (the default) uses each theme's own font. Picking any other font applies it to every theme until the user taps Theme again, so font, theme and paper mix freely. Anniversary's theme font is Classic italic. Picking Classic applies it upright.
- **Dark/Light switch:** picks the theme's dark or light colours. It is hidden for the Plain group, where each colour is its own theme.
- **Texture, text size and margins:** global settings, not part of a theme. They are remembered across themes and sessions. Any theme works with any font, any texture, any size and any margin.
- **Signature dot:** the theme's tint. In the Plain group it is vermilion.
- **Saved theme ("Mine"):** stores the base theme id, the font choice, the dark/light choice, the texture switch and choice, the text size and the margins. Applying it sets all of those. It keeps the base theme's motif and its Sympathy-style rules.

### Plain group (themes with no motif)

| Name | Ground | Ink |
|---|---|---|
| Night (default) | `#0E0E0D` | `#EDEAE3` |
| Cream | `#F3EEE3` | `#2A2622` |
| Blush | `#F2E4DF` | `#3A2A28` |
| Sage | `#E3E8DE` | `#27301F` |
| Ink blue | `#18233A` | `#E6E3DA` |

Plain themes use the Clean font by default, no motif, the vermilion signature dot, and have no dark/light variants.

### Paper texture

- One switch, off by default. The setting is remembered across themes and sessions.
- When it is on, the theme's suggested texture is applied. The user can pick Grain, Lined or Laid instead, and that choice is also remembered.
- **Grain:** fine random noise drawn into the canvas at low opacity. Seed it so the preview and the export match.
- **Lined:** horizontal rules at 25% of ink-on-ground strength, spaced to the body line height and aligned to the text baselines.
- **Laid:** vertical chain lines every 24 layout px at about 4% opacity.

### Themes

A theme sets font, colours (ground, ink and tint) and a suggested texture, and may add a motif.

Rules every theme follows:
- one motif in one zone (top band, one corner, or bottom band), covering at most 6% of the canvas
- line drawings with a single stroke of about 1.5px at 1080 wide, in the tint colour, with no fills except small dots
- ink at least 7:1 contrast against ground
- motifs drawn with canvas paths (or inline SVG rendered to the canvas), with no photo assets

Each theme has a dark and a light version with the same font, motif and texture. The image's Dark/Light switch defaults to the device's colour scheme the first time and is then remembered.

| Group | Theme | Font | Suggested texture | Motif and zone | Dark: ground / ink / tint | Light: ground / ink / tint |
|---|---|---|---|---|---|---|
| Seasons | Spring | Classic | Plain | Flowering branch, top right: green stem and leaves, five-petal blossoms in pink (`#E58FA2` light, `#EBA0B1` dark) with `#F3C969` centres. The only theme with more than one motif colour. | `#17201A` / `#EEF2E6` / `#93BC7F` | `#F5F3E6` / `#26301F` / `#6E9A5B` |
| Seasons | Monsoon | Clean | Grain | Small rain cloud with five uneven slanted drops, top right | `#142024` / `#E3ECEA` / `#7FA3A0` | `#E8EFEE` / `#1B2A2C` / `#5F8D8A` |
| Seasons | Autumn | Classic | Grain | One falling leaf outline, bottom right | `#2A1F18` / `#F0E4D4` / `#B5683A` | `#F4EADF` / `#2E2119` / `#B5683A` |
| Seasons | Winter | Typed | Plain | Six-armed snowflake, top centre | `#141A20` / `#E6ECF0` / `#7F93A3` | `#EEF1F3` / `#1F2A33` / `#8396A6` |
| Places | Rainier | Clean | Grain | Mount Rainier outline with a zigzag snowline, a faint ground line and three small firs at its left foot, bottom right, about 30% of the width | `#121A1B` / `#E6ECE8` / `#8FA6A8` | `#EEF1EF` / `#1E2A28` / `#6F8B86` |
| Occasions | Birthday | Hand | Plain | One candle with a teardrop flame, top centre | `#1A1614` / `#F3EBDF` / `#D0533A` | `#F6EFE4` / `#2A2522` / `#D0533A` |
| Occasions | Anniversary | Classic italic | Plain | Two interlocked hairline rings, top centre | `#121212` / `#EDE6D8` / `#B89A6A` | `#F5F0E6` / `#2A241C` / `#A88A5A` |
| Occasions | New baby | Hand | Plain | Crib mobile, top centre: a curved bar with a moon, a star and a cloud hanging on strings of different lengths | `#1C1A1E` / `#F1ECE6` / `#C7B4D6` | `#FBF6EE` / `#35302C` / `#B79CC9` |
| Occasions | Diwali | Classic | Grain | Diya outline with a flame, bottom centre | `#1A1410` / `#F4E6CF` / `#E39B3B` | `#FAF1E2` / `#2E2115` / `#D2862A` |
| Occasions | Eid | Classic | Plain | Crescent with an eight-point star, top right | `#0F1D24` / `#EDE7D9` / `#C9B27A` | `#F1EEE4` / `#16262E` / `#AA9259` |
| Occasions | Christmas | Classic | Grain | Two holly leaves with three berry dots, top left | `#14231C` / `#F1ECE2` / `#B8473A` | `#F4F0E8` / `#1B2A22` / `#B8473A` |
| Occasions | Thank you | Typed | Laid | A folded dog-ear corner, bottom right | `#191A16` / `#ECEAE2` / `#8C9A76` | `#F2EEE6` / `#262420` / `#7E8C6A` |
| Occasions | Sympathy | Classic | Plain | No motif. Margins are 14%, the size cap is 15% lower and the dot is grey. | `#161616` / `#D9D6D0` / `#5A5854` | `#EFEEEB` / `#2B2A28` / `#A3A09A` |

The motif drawings in `themes.html` and `new-baby.html` are the reference shapes. Theme data should live in one plain data file, so adding a theme means adding one entry and one motif-drawing function.

### My themes

- "Save as my theme" asks for a name and stores the current font, colour (or theme colours), dark/light choice and texture in `localStorage`.
- Saved themes appear under Mine.
- Each saved theme has a small remove control. My call: an x on its thumbnail.

## Sharing and saving

- Render the export PNG to a Blob ahead of time, starting as soon as the user taps Done and again whenever the image changes and the user is idle, so the Share tap calls `navigator.share` straight away without losing the user's tap permission.
- While the Blob for the current state is not ready, Share and Save show a disabled "Preparing" state. They never wait inside the tap handler.
- **Phone bar when file sharing is unsupported** (for example Firefox on Android, or some in-app browsers): Share is replaced by Copy image if image clipboard writes are supported. Otherwise only Save shows, full width. The caption checkbox is hidden in both cases.
- Share: `navigator.share({ files: [png], title: "Inked." })`, plus `text` when the caption checkbox is on.
- Copy image: `navigator.clipboard.write([new ClipboardItem({'image/png': blob})])`. The button briefly reads "Copied".
- Save: download the PNG. File name: `inked-<yyyy-mm-dd>.png`.
- If sharing or copying fails or is cancelled, nothing else happens. There is no error toast for a cancel.

## Draft and privacy

- Autosave the text, title, shape, theme, dark/light choice, font, text size, margins, texture switch, texture choice, caption checkbox and saved themes to `localStorage` as the user works.
- Wrap every storage call in try/catch. The app works without storage.
- Clear (the two-tap action) wipes the text and title. Saved themes and style preferences stay.
- No network requests other than loading the site's own files. No analytics. No third-party fonts at runtime.

## Accessibility

- The preview canvas has `role="img"` and an `aria-label` containing the title and text, truncated sensibly.
- Text-size changes and the "Try Story" hint are announced through an `aria-live="polite"` region.
- Every control is keyboard reachable with a visible focus ring in seal colour.
- Respect `prefers-reduced-motion`, `prefers-reduced-transparency`, `prefers-contrast` and `forced-colors` as described above.

## Open-source packaging

- `README.md`: what Inked. is, a screenshot, how to run it locally, how to deploy it to GitHub Pages, and how to add a theme.
- Licence: MIT for the code (my call). Font licence files sit next to the fonts.
- Remove `gen_image.sh` and the old generator files once Inked. replaces them.

## Left to the builder

- File and module structure, as long as it stays build-free. ES modules loaded with `<script type="module">` are fine.
- Exact motif path coordinates, following the reference drawings.
- Grain noise algorithm.
- How to test. A reasonable approach is pure layout functions (wrap, fit, size band) taking a `measureText` function, tested with Node's built-in test runner, plus a manual checklist on an iPhone, an Android phone and a desktop browser.
- Desktop breakpoint details between 600 and 900px.

## Calls made by Claude, for the owner to check

- No PWA or offline mode (the UX reviewer advised against it because of stale caching on GitHub Pages).
- Everything starts from a theme: the separate Colour row is gone, and its colours became the Plain theme group.
- The font choice is global: Theme (each theme's own font) or one fixed font across all themes. Saved themes capture every style setting.
- Share fallbacks on phones: Copy image, or Save only. A "Preparing" state shows while the export renders.
- Other scripts use the device's fonts instead of bundled ones, so a letter in Japanese looks slightly different on an iPhone and on Android. Bundling fonts for every script would add many megabytes.
- Export resolution: 3x a 1080-wide layout, 2.75x for Story, to stay under iOS canvas limits. This is lower than the old 4800x6000, which iPhones cannot create.
- Paper texture off by default.
- Text size presets cap the size (Small 44, Medium 64, Large 88 layout px) rather than fix it, so auto-fit can still shrink long letters. Margin presets are 7%, 11% and 15%.
- Core colours have no dark/light variants.
- The app chrome follows the device's colour scheme. The image's Dark/Light switch is separate and starts from the device's scheme.
- MIT licence.
- Removing a saved theme with an x on its thumbnail.
