# @metadata/exif

%NPM: @metadata/exif%

`@metadata/exif` is [fork](https://github.com/exif-js/exif-js) of JavaScript Library For Reading EXIF Image Metadata. It Reads Files Metadata In The Browser. The package has been optimised with _Google Closure Compiler_.

The differences to the original package is that at the moment, only the `handleBinaryFile` method is implemented. There are also some bug-fixes and features, including the options to parse dates into _Date_ object, the coordinates format specification option, and correct parsing of UTF-8 data which was wrong in the origin. The _XMP_ support has been removed for a near future. _IPTC_ tags will have names consistent with [`exiftool`](https://www.sno.phy.queensu.ca/~phil/exiftool/TagNames/IPTC.html).

```sh
yarn add -E @metadata/exif
```

## Table Of Contents

%TOC%

%~%