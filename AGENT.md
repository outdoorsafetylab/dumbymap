# DumbyMap — Agent Reference

This document gives LLM agents a concise, actionable picture of the DumbyMap repository so they can contribute to it accurately.

---

## What the project does

DumbyMap is a browser library that converts Semantic HTML and Markdown into interactive map pages. The two exported functions do all the work:

```js
import { markdown2HTML, generateMaps } from 'dumbymap'

const container = document.getElementById('app')
markdown2HTML(container, markdownString)   // parse markdown → HTML
generateMaps(container, options)           // wire up maps, links, layouts
```

Maps are declared as YAML inside fenced `` ```map `` code blocks. Rendering delegates to the `mapclay` library (MapLibre / OpenLayers / Leaflet).

---

## Repository layout

```
src/
  dumbymap.mjs    # Public API: markdown2HTML + generateMaps
  editor.mjs      # EasyMDE editor integration
  Layout.mjs      # Layout classes: Layout, SideBySide, Overlay, Sticky
  Link.mjs        # GeoLink, DocLink factories + LeaderLine wiring
  MenuItem.mjs    # Context-menu item factories
  marker.mjs      # Predefined marker icon definitions
  dumbyUtils.mjs  # Map focus, block navigation, geo-text parsing
  utils.mjs       # Generic DOM helpers: onRemove, animateRectTransition, throttle, debounce

scripts/
  build.sh              # CSS symlinks + renderer copy + rollup
  rollup.config.js      # Rollup bundle config (ESM output)

example/              # Standalone HTML pages, each covers one feature
dist/                 # Build output (not committed)
```

---

## Core concepts

### DOM structure produced by `generateMaps`

```
div.Dumby               ← container, carries data-layout / data-crs
  div.SemanticHtml      ← processed HTML (markdown or existing)
    article.dumby-block ← content chunk (split on 2+ blank lines)
      pre > code.language-map  ← YAML map definition
  div.Showcase          ← displays the focused map
    div.dumby-block
      div.mapclay       ← rendered map instance
```

Key data attributes on `.Dumby`:
- `data-layout` — active layout name (`normal` | `side-by-side` | `overlay` | `sticky`)
- `data-crs` — coordinate reference system for geo-text parsing (default `EPSG:4326`)

### Map code blocks

````markdown
```map
use: Maplibre          # or Openlayers / Leaflet (default: Leaflet)
id: my-map             # optional; used by GeoLinks to target this map
center: [121.56, 25.03]
zoom: 12
```
````

Common YAML keys: `use`, `id`, `center`, `zoom`, `bounds`, `width`, `aliases`.

### GeoLinks

Anchor elements with a `geo:` href. Created automatically from plain-text coordinate patterns *or* written manually:

```html
<a href="geo:25.03,121.56">Taipei 101</a>
```

Query parameters that change behaviour:

| Param | Effect |
|-------|--------|
| `id` | Target only the map(s) with these ids (comma-separated) |
| `xy` | Override coordinates with projected values (e.g. `xy=274527,2665529`) |
| `type` | Marker appearance (`circle`) |
| `text` | Leader-line label override |

### DocLinks

Anchor elements with a hash href and a title starting with `=>`:

```markdown
[see map](#section "=>.mapclay")
```

On hover, draws a leader line to the CSS-selector-identified target.

### Layouts

| Name | Behaviour |
|------|-----------|
| `normal` | Default flow; showcase scrolls with page |
| `side-by-side` | Draggable splitter bar between content and showcase |
| `overlay` | Maps fill viewport; content blocks become draggable floating windows |
| `sticky` | Showcase becomes a draggable floating panel (bottom-right) |

Switch layout programmatically:

```js
container.dataset.layout = 'overlay'
```

### `generateMaps` options

```js
generateMaps(container, {
  contentSelector: null,   // CSS selector for the SemanticHtml element
  crs: 'EPSG:4326',        // CRS for auto-detected geo coordinates
  initialLayout: 'normal', // starting layout name
  layouts: [],             // extra Layout instances or name strings
  mapDelay: 1000,          // ms before rendering maps
  render: defaultRender,   // mapclay render function override
  renderCallback: () => null,
  defaultApply: '...',     // URL of default YAML applied to all maps
})
```

The returned `dumbymap` object exposes:
- `.container` / `.htmlHolder` / `.showcase` — DOM references
- `.blocks` — live array of `.dumby-block` elements
- `.layouts` — registered Layout instances
- `.utils` — bound utility functions: `focusNextMap`, `focusNextBlock`, `switchToNextLayout`, `renderedMaps`, `setContextMenu`

---

## Development workflow

```bash
npm run dev      # live-server on :8080 with hot reload
npm run watch    # rollup watch mode (no server)
npm run build    # full production build → dist/
npm run lint     # StandardJS auto-fix
npm run style    # Stylelint on CSS
```

No test framework. Validate changes with `lint` + manual inspection in `example/`.

---

## Example pages (in `example/`)

Each file is self-contained and imports from `../dist/`. Open them after `npm run build`:

| File | Demonstrates |
|------|-------------|
| `01-basic-maps.html` | Three renderer backends, YAML options table |
| `02-geolinks.html` | Auto-detected coordinates, manual geo: anchors, `id` targeting |
| `03-doclinks.html` | DocLink leader lines |
| `04-layouts.html` | All four layouts + keyboard shortcuts |
| `05-markers.html` | Predefined marker icons |
| `06-multiple-maps.html` | Multiple map blocks on one page |
| `07-crs.html` | Non-WGS84 CRS via `data-crs` or `generateMaps` option |
| `08-geocoding.html` | Geocoding integration |
| `09-drag-to-geolink.html` | Drag selected text onto a map to create a GeoLink |

---

## Adding features — patterns to follow

**New layout:** subclass `Layout` in `src/Layout.mjs`, provide `enterHandler` / `leaveHandler`, then pass it to `generateMaps`:

```js
import { Layout } from './src/Layout.mjs'

const myLayout = new Layout({
  name: 'my-layout',
  enterHandler ({ container }) { /* … */ },
  leaveHandler ({ container }) { /* … */ },
})

generateMaps(container, { layouts: [myLayout] })
```

**New context-menu item:** add a factory function in `src/MenuItem.mjs` following the existing patterns, then register it inside `generateMaps` in `dumbymap.mjs`.

**New marker icon:** add an SVG/URL entry to `src/marker.mjs`.

**DOM utilities:** add pure helpers to `src/utils.mjs`; map-specific helpers to `src/dumbyUtils.mjs`.

---

## Constraints and conventions

- **StandardJS** — no semicolons, 2-space indent, single quotes. Run `npm run lint` before committing.
- **Stylelint** — CSS lives outside `src/`; check with `npm run style`.
- **ESM only** — all source files use ES module syntax (`import`/`export`). No CommonJS.
- **Browser-only API** — code in `src/` freely uses `document`, `window`, `MutationObserver`, etc. There is no SSR concern.
- **No test framework** — verify with the example pages; manual QA is the norm.
- **Build output not committed** — `dist/` is `.gitignore`d; always build locally before testing examples.
- **API is unstable** — the project is pre-1.0; breaking changes in public API are acceptable.
