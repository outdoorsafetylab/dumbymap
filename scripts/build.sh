#! /bin/bash

rm -rf dist
mkdir dist

# CSS
mkdir dist/css
ls src/css | xargs -I {} ln src/css/{} dist/css/{}

# Renderer
mkdir dist/renderers
ls node_modules/mapclay/dist/renderers | xargs -I {} ln node_modules/mapclay/dist/renderers/{} dist/renderers/{}

# EasyMDE
ln -f node_modules/easymde/dist/easymde.min.js dist/easymde.min.js
ln -f node_modules/easymde/dist/easymde.min.css dist/css/easymde.min.css

npm run rollup
