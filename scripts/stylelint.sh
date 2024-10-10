#! /bin/bash

shopt -s extglob
stylelint -c scripts/stylelintrc.json src/css/!(easymde.min.css) --fix
