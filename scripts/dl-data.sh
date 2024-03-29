#!/usr/bin/env bash

#zip -r rcw.zip rcw
# zip -r rcw.zip rcw/*

wget "https://pub.anw.sh/rcw.zip" -O rcw.zip
unzip -o rcw.zip -d documents
rm rcw.zip

pushd documents || exit
rm -rf __MACOSX
popd || exit
# mv rcw documents
