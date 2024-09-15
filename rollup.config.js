import node from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import { existsSync } from 'fs';
import { join } from 'path';

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
      name: 'leader-line',
      transform(code, id) {
        if (id.includes('node_modules/leader-line/')) {
          return `${code}\nexport default LeaderLine;`;
        }
        return null;
      },
    },
    {
      name: 'plain-draggable',
      transform(code, id) {
        if (id.includes('node_modules/plain-draggable/')) {
          const removePattern = /window\.addEventListener\('scroll'[^\)]*\)/
          return `${code.replace(removePattern, "")}`;
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
