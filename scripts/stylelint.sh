#! /bin/bash

shopt -s extglob
stylelint src/css/!(easymde.min.css) --fix
