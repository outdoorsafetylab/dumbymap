// ESM shim: runs proj4 UMD (which falls back to globalThis assignment in ES module context)
import '../../node_modules/proj4/dist/proj4-src.js'
export default globalThis.proj4
