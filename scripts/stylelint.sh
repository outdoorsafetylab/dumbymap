#! /bin/bash

shopt -s extglob
npx stylelint src/css/!(easymde.min.css)
