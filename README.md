# @metadata/exif

[![npm version](https://badge.fury.io/js/%40metadata%2Fexif.svg)](https://npmjs.org/package/@metadata/exif)

`@metadata/exif` is [fork](https://github.com/exif-js/exif-js) of JavaScript Library For Reading EXIF Image Metadata. It Reads Files Metadata In The Browser. The package has been optimised with _Google Closure Compiler_.

The differences to the original package is that at the moment, only the `handleBinaryFile` method is implemented. There are also some bug-fixes and features, including the options to parse dates into _Date_ object, the coordinates format specification option, and correct parsing of UTF-8 data which was wrong in the origin. The _XMP_ support has been removed for a near future. _IPTC_ tags will have names consistent with [`exiftool`](https://www.sno.phy.queensu.ca/~phil/exiftool/TagNames/IPTC.html).

```sh
yarn add -E @metadata/exif
```

## Table Of Contents

- [Table Of Contents](#table-of-contents)
- [Usage](#usage)
- [API](#api)
- [`handleBinaryData(binFile: ArrayBuffer, config?: HandleBinaryFile): { data, iptcdata }`](#handlebinarydatabinfile-arraybufferconfig-handlebinaryfile--data-iptcdata-)
  * [`_exif.HandleBinaryFile`](#type-_exifhandlebinaryfile)
- [Copyright](#copyright)

<p align="center"><a href="#table-of-contents"><img src=".documentary/section-breaks/0.svg?sanitize=true"></a></p>

## Usage

There are 3 ways to use the package:

1. As an ES6 module, because the `module` field of the _package.json_ file is set to `src/index.js` which exports a ES6 module.
2. As a CommonJS module, because the `main` field of the _package.json_ file is set to `build/index.js` which is the same as the module, but where the import/export statements have been transpiled into `module.exports` and `require`.
3. As a browser bundle, compiled with _GCC_ that sets the `window.EXIF` object to the package API. To do that, grab the file from the [dist](dist) folder and add it to the page.

## API

During development, the package is available by importing its named functions:

```js
import { handleBinaryData } from '@metadata/exif'
```

<p align="center"><a href="#table-of-contents"><img src=".documentary/section-breaks/1.svg?sanitize=true"></a></p>

## `handleBinaryData(`<br/>&nbsp;&nbsp;`binFile: ArrayBuffer,`<br/>&nbsp;&nbsp;`config?: HandleBinaryFile,`<br/>`): { data, iptcdata }`

Extract metadata from the _ArrayBuffer_.

![Cat](test/fixture/images/photo.jpg)

```js
import { inspect } from 'util'
import { readBuffer } from '@wrote/read'
import { handleBinaryFile } from '@metadata/exif'

(async () => {
  const { buffer: photo } = (await readBuffer('test/fixture/images/photo.jpg'))
  const res = handleBinaryFile(photo, {
    parseDates: true,
    coordinates: 'dms',
  })
  console.log(inspect(res, null, 100))
})()
```
```js
{ data: 
   { Make: 'Canon',
     Model: 'Canon EOS 400D DIGITAL',
     Orientation: 1,
     XResolution: { [Number: 72] numerator: 72, denominator: 1 },
     YResolution: { [Number: 72] numerator: 72, denominator: 1 },
     ResolutionUnit: 2,
     DateTime: 2015-06-20T20:10:14.000Z,
     Copyright: 'Ã®† ∂éçø',
     ExifIFDPointer: 218,
     GPSInfoIFDPointer: 648,
     ExposureTime: { [Number: 0.04] numerator: 1, denominator: 25 },
     FNumber: { [Number: 1.6] numerator: 8, denominator: 5 },
     ExposureProgram: 'Aperture priority',
     ISOSpeedRatings: 200,
     ExifVersion: '0221',
     DateTimeOriginal: 2015-06-20T20:10:14.000Z,
     DateTimeDigitized: 2015-06-20T20:10:14.000Z,
     ComponentsConfiguration: 'YCbCr',
     ShutterSpeedValue: 4.64385986328125,
     ApertureValue: { [Number: 1.35614013671875] numerator: 22219, denominator: 16384 },
     ExposureBias: 0,
     MaxApertureValue: { [Number: 1.3989796723380756] numerator: 53199, denominator: 38027 },
     MeteringMode: 'Pattern',
     Flash: 'Flash did not fire, compulsory flash mode',
     FocalLength: { [Number: 50] numerator: 50, denominator: 1 },
     FlashpixVersion: '0100',
     ColorSpace: 1,
     PixelXDimension: 250,
     PixelYDimension: 167,
     FocalPlaneXResolution: { [Number: 3210.94640682095] numerator: 2636187, denominator: 821 },
     FocalPlaneYResolution: { [Number: 3230.2405498281787] numerator: 940000, denominator: 291 },
     FocalPlaneResolutionUnit: 2,
     CustomRendered: 'Normal process',
     ExposureMode: 0,
     WhiteBalance: 'Auto white balance',
     SceneCaptureType: 'Standard',
     GPSVersionID: '2.3.0.0',
     GPSLatitudeRef: 'N',
     GPSLatitude: 
      [ { [Number: 40] numerator: 40, denominator: 1 },
        { [Number: 15] numerator: 15, denominator: 1 },
        { [Number: 3.2471999364524584] numerator: 40879, denominator: 12589 } ],
     GPSLongitudeRef: 'W',
     GPSLongitude: 
      [ { [Number: 75] numerator: 75, denominator: 1 },
        { [Number: 7] numerator: 7, denominator: 1 },
        { [Number: 57.5688] numerator: 71961, denominator: 1250 } ],
     thumbnail: {} },
  iptcdata: 
   { Category: 'ANI',
     'Caption-Abstract': 'A black cat looking into the camera.',
     Keywords: [ 'Animal', 'Cat', 'Pet' ],
     Credit: 'Art Deco',
     DateCreated: '20150620',
     'By-lineTitle': [ 'Photographer', 'Owner' ],
     'Writer-Editor': [ 'Art', 'Deco' ],
     Headline: 'Black Cat',
     CopyrightNotice: '© Ã®† ∂éçø 2019, All rights reserved.',
     'By-line': [ 'Anton', 'His Friend' ] } }
```

__<a name="type-_exifhandlebinaryfile">`_exif.HandleBinaryFile`</a>__: Options for the `handleBinaryFile` method.

|    Name     |       Type       |                                                      Description                                                      | Default |
| ----------- | ---------------- | --------------------------------------------------------------------------------------------------------------------- | ------- |
| parseDates  | <em>boolean</em> | Parse EXIF dates into JS dates.                                                                                       | `false` |
| coordinates | <em>string</em>  | Return coordinates either as DMS (degrees, minutes, seconds) or DD (decimal degrees). Specified as `'dms'` or `'dd'`. | `dms`   |

<p align="center"><a href="#table-of-contents"><img src=".documentary/section-breaks/2.svg?sanitize=true"></a></p>

## Copyright

(c) [Demimonde][1] 2019

[1]: https://demimonde.cc

<p align="center"><a href="#table-of-contents"><img src=".documentary/section-breaks/-1.svg?sanitize=true"></a></p>