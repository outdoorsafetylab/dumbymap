#! /bin/bash

rm -rf dist
mkdir dist

# CSS
mkdir dist/css
cp src/css/* dist/css/

# Renderer
mkdir dist/renderers
cp node_modules/mapclay/dist/renderers/* dist/renderers/

npm run rollup
