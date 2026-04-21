#! /bin/bash

rm -rf dist
mkdir dist

# CSS
mkdir dist/css
ls src/css | xargs -I {} ln src/css/{} dist/css/{}

# Renderer
mkdir dist/renderers
ls node_modules/mapclay/dist/renderers | xargs -I {} ln node_modules/mapclay/dist/renderers/{} dist/renderers/{}

npm run rollup
