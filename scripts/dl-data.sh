#zip -r rcw.zip rcw
# zip -r rcw.zip rcw/*

wget "https://pub.4nz.io/rcw.zip" -O rcw.zip
unzip -o rcw.zip -d documents
rm -rf __MACOSX
# mv rcw documents
rm rcw.zip
