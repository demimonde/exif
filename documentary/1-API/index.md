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

%~%

```## handleBinaryData => { data, iptcdata }
[
  ["binFile", "ArrayBuffer"],
  ["config?", "HandleBinaryFile"]
]
```

Extract metadata from the _ArrayBuffer_.

![Cat](test/fixture/images/photo.jpg)

%EXAMPLE: example, ../src => @metadata/exif%
%FORK-js example%

%TYPEDEF types/index.xml%

%~%