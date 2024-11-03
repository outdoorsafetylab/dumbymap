import { default as Leaflet } from '../../../node_modules/mapclay/dist/renderers/leaflet.mjs'

if (!globalThis.mapclayRenderers) globalThis.mapclayRenderers = {}
globalThis.mapclayRenderers.Leaflet = Leaflet
