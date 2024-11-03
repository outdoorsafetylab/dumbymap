import { default as Openlayers } from '../../../node_modules/mapclay/dist/renderers/openlayers.mjs'

if (!globalThis.mapclayRenderers) globalThis.mapclayRenderers = {}
globalThis.mapclayRenderers.Openlayers = Openlayers
