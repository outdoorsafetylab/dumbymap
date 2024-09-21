#! /bin/bash

VERSION=`jq -r .version package.json`
TMP=`mktemp`

read -p "$VERSION -> " -i $VERSION -e ANSWER

jq ".version = \"$ANSWER\"" package.json >$TMP
cat $TMP >package.json

git reset
git add package.json; git commit -m "chore(relase): $ANSWER"

git show HEAD
