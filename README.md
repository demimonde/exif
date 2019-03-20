# @metadata/exif

[![npm version](https://badge.fury.io/js/%40metadata%2Fexif.svg)](https://npmjs.org/package/@metadata/exif)

`@metadata/exif` is Reads Files Metadata In The Browser.

```sh
yarn add -E @metadata/exif
```

## Table Of Contents

- [Table Of Contents](#table-of-contents)
- [API](#api)
- [`exif(arg1: string, arg2?: boolean)`](#exifarg1-stringarg2-boolean-void)
  * [`Config`](#type-config)
- [Copyright](#copyright)

<p align="center"><a href="#table-of-contents"><img src=".documentary/section-breaks/0.svg?sanitize=true"></a></p>

## API

The package is available by importing its default function:

```js
import exif from '@metadata/exif'
```

<p align="center"><a href="#table-of-contents"><img src=".documentary/section-breaks/1.svg?sanitize=true"></a></p>

## `exif(`<br/>&nbsp;&nbsp;`arg1: string,`<br/>&nbsp;&nbsp;`arg2?: boolean,`<br/>`): void`

Call this function to get the result you want.

__<a name="type-config">`Config`</a>__: Options for the program.

|    Name     |      Type       |                                      Description                                      | Default |
| ----------- | --------------- | ------------------------------------------------------------------------------------- | ------- |
| parseDates  | _boolean_       | Parse EXIF dates into JS dates.                                                       | `false` |
| coordinates | _('dms'\|'dd')_ | Return coordinates either as DMS (degrees, minutes, seconds) or DD (decimal degrees). | `dms`   |

```js
/* yarn example/ */
import exif from '@metadata/exif'

(async () => {
  const res = await exif({
    text: 'example',
  })
  console.log(res)
})()
```
```

```

<p align="center"><a href="#table-of-contents"><img src=".documentary/section-breaks/2.svg?sanitize=true"></a></p>

## Copyright

(c) [Demimonde][1] 2019

[1]: https://demimonde.cc

<p align="center"><a href="#table-of-contents"><img src=".documentary/section-breaks/-1.svg?sanitize=true"></a></p>