import { default as Maplibre } from '../../../node_modules/mapclay/dist/renderers/maplibre.mjs'

if (!globalThis.mapclayRenderers) globalThis.mapclayRenderers = {}
globalThis.mapclayRenderers.Maplibre = Maplibre
