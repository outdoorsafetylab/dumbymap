#! /bin/bash

mkdir -p addon/css
ln -f src/css/dumbymap.css addon/css/dumbymap.css

mkdir -p addon/scripts
rollup --format=iife addon/src/dumbymap.mjs --dir addon/scripts
ls addon/src/* | xargs -i rollup --format=iife {} --dir addon/scripts
