import node from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'
import { existsSync } from 'fs'
import { join } from 'path'
import { bundleStats } from 'rollup-plugin-bundle-stats'

const prod = process.env.PRODUCTION
const watch = process.env.ROLLUP_WATCH

function resolve (file, origin) {
  // Your way to resolve local include path
}

function pathResolve (options) {
  return {
    resolveId: function (file, origin) {
      // Your local include path must either starts with `./` or `../`
      if (file.startsWith('./') || file.startsWith('../')) {
        // Return an absolute include path
        return resolve(file, origin)
      }
      return null // Continue to the next plugins!
    },
  }
}

const general = {
  output: [
    {
      dir: './dist',
      format: 'esm',
      entryFileNames: '[name].mjs',
    },
  ],
  watch: {
    clearScreen: false,
    include: ['src/**', 'node_modules/mapclay/dist/mapclay.mjs'],
  },
  context: 'window',
  plugins: [
    {
      name: 'watch-mapclay',
      buildStart () {
        const mapclayPath = join(process.cwd(), 'node_modules', 'mapclay', 'dist', 'mapclay.mjs')
        if (existsSync(mapclayPath)) {
          this.addWatchFile(mapclayPath)
        } else {
          console.warn('mapclay.mjs not found at:', mapclayPath)
        }
      },
    },
    {
      name: 'leader-line',
      transform (code, id) {
        if (id.includes('node_modules/leader-line/')) {
          return `${code}\nexport default LeaderLine;`
        }
        return null
      },
    },
    pathResolve(),
    node(),
    commonjs(),
    prod && terser({
      keep_fnames: true,
    }),
    prod && bundleStats(),
  ],
}

export default [
  {
    input: 'src/editor.mjs',
  },
  {
    input: 'src/dumbymap.mjs',
  },
]
  .map(config => ({ ...general, ...config }))
  .filter(config => {
    if (watch) return config.input.match(/editor/)
    return true
  })
