import { generateMaps } from '../../dist/dumbymap.mjs'
import { renderWith } from '../../node_modules/mapclay/dist/mapclay.mjs'

globalThis.generateMaps = generateMaps
globalThis.renderWith = renderWith
globalThis.mapclayRenderers = {}
