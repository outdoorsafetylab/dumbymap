#!/bin/bash

git checkout gh-pages -- .gitignore index.html && \
npm run build && npm run docs && \
git branch --force gh-pages HEAD && \
git checkout gh-pages && \
git add --all && git commit -m gh-pages && \
git push -f &&
git checkout HEAD^
