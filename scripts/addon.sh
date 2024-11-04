#! /bin/bash

mkdir -p addon/css
ln -f src/css/dumbymap.css addon/css/dumbymap.css

mkdir -p addon/renderers/
rollup addon/src/renderers/* --dir addon/renderers

rollup addon/src/dumbymap.mjs --file addon/dumbymap.js
