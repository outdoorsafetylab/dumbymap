# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev       # Start live-server on port 8080 with hot reload
npm run watch     # Rollup in watch mode

# Build
npm run build     # Full build: CSS symlinks + renderers + rollup bundle into dist/
npm run rollup    # Rollup bundling only

# Code quality
npm run lint      # StandardJS linter with auto-fix
npm run style     # Stylelint on CSS files

# Documentation
npm run docs      # Generate JSDoc and serve on localhost:8080

# Firefox addon
npm run addon     # Build Firefox addon
npm run dev-addon # Run Firefox addon in development mode
```

**Tests:**
- `npm run test` — Vitest unit tests (config: `scripts/vitest.config.js`); excludes e2e
- `npm run test:e2e` — Playwright e2e tests (config: `scripts/playwright.config.js`)

Code quality is maintained via StandardJS (`lint`) and Stylelint (`style`).

## Architecture

DumbyMap converts Semantic HTML and Markdown into pages with interactive maps. The two main exported functions are in `src/dumbymap.mjs`:

- `markdown2dumbyBlock(container, mdContent)` — parses markdown (via `markdown-it`) into HTML with semantic enhancements
- `generateMaps(container, options)` — initializes the map system: observes DOM, renders maps from YAML code blocks, wires up links and layouts

The rendered DOM structure:
- `.Dumby` — root container
  - `.SemanticHtml` — processed HTML content with map code blocks and links
  - `.Showcase` — map display area with `.dumby-block` wrappers containing `.mapclay` map instances

**Key source files:**

| File | Role |
|------|------|
| `src/dumbymap.mjs` | Core library; map rendering, DOM observers, layout/link orchestration |
| `src/Layout.mjs` | Layout classes: `Layout`, `SideBySide`, `Overlay`, `Sticky` |
| `src/Link.mjs` | `GeoLink` (geo-scheme anchors), `DocLink` (fragment links), LeaderLine wiring |
| `src/MenuItem.mjs` | Context menu item factories for maps, blocks, and links |
| `src/marker.mjs` | Predefined marker icon definitions (pin, circle, campsite, caution, etc.) |
| `src/dumbyUtils.mjs` | Map utilities: focus navigation, marker placement, geo-coordinate parsing |
| `src/utils.mjs` | Generic DOM helpers: `onRemove()`, `animateRectTransition()`, `throttle()`, `debounce()` |
| `src/tutorial.mjs` | Tutorial/onboarding logic |
| `src/vendor/` | Vendored libs: `leader-line.mjs`, `markdown-it-*`, `proj4.mjs` |

**Map rendering** delegates to the `mapclay` library, which supports MapLibre, OpenLayers, and Leaflet. Maps are defined as YAML inside fenced code blocks tagged `` `map ``.

**Links:**
- *GeoLinks* — `<a href="geo:lat,lon">` elements that focus map positions
- *DocLinks* — `<a href="#selector">` elements linking to document fragments
- Both use `leader-line` to draw visual connectors between content and maps

**`generateMaps` decomposition:** The function is composed from many individually exported setup functions — `setupContainer`, `resolveHtmlHolder`, `wrapDumbyBlocks`, `createShowcase`, `createModal`, `buildDumbymap`, `setupContentObserver`, `setupChildObserver`, `setupLayoutObserver`, `setupContextMenu`, `setupMouseDrag`, `setupKeybindings`. These are unit-testable independently.

Notable exports: `assignMapId(config)`, `fetchDefaultAliases(url, dumbymap)` (loads YAML alias config from URL), `htmlToMd(node)`, `splitMd(md)`.

`generateMaps` option `urlParams: true` reads `?layout=` query param and syncs it with the active layout.

**Reference docs:**
- `docs/FEATURES.md` — numbered, exhaustive list of all behaviors (initialization, rendering, layouts, links, keybindings, public API, etc.)
- `docs/workflow.mermaid` — full flowchart of the `generateMaps()` execution path, including all composable setup functions and the `renderMap()` sub-flow

**Build:** `scripts/build.sh` symlinks CSS/renderer assets into `dist/`, then Rollup (config in `scripts/rollup.config.js`) bundles `src/dumbymap.mjs` as ESM output. Set `PRODUCTION=true` to enable terser minification.
