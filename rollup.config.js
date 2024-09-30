import node from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import { existsSync } from 'fs';
import { join } from 'path';
import { bundleStats } from 'rollup-plugin-bundle-stats';

const production = !process.env.ROLLUP_WATCH;

const general = {
  output: [
    {
      dir: './dist',
      format: 'esm',
      entryFileNames: '[name].mjs',
    }
  ],
  watch: {
    clearScreen: false,
    include: ["src/**", "mapclay/dist/mapclay.mjs"]
  },
  context: "window",
  plugins: [
    {
      name: 'watch-mapclay',
      buildStart() {
        const mapclayPath = join(process.cwd(), 'mapclay', 'dist', 'mapclay.mjs');
        console.log('Watching:', mapclayPath);
        if (existsSync(mapclayPath)) {
          this.addWatchFile(mapclayPath);
        } else {
          console.log('mapclay.mjs not found at:', mapclayPath);
        }
      }
    },
    {
      name: 'leader-line',
      transform(code, id) {
        if (id.includes('node_modules/leader-line/')) {
          return `${code}\nexport default LeaderLine;`;
        }
        return null;
      },
    },
    {
      name: 'mapclay',
      resolveId(source) {
        if (source === 'mapclay' && existsSync(join('.', 'mapclay'))) {
          return './mapclay/dist/mapclay.mjs';
        }
        return null;
      }
    },
    node(),
    commonjs(),
    production && terser(),
    // bundleStats(),
  ],
}

export default [
  {
    input: "src/editor.mjs",
  },
  {
    input: "src/dumbymap.mjs",
  },
]
  .map(config => ({ ...general, ...config }))
  .filter((config) => production || config.input.match(/editor/))
