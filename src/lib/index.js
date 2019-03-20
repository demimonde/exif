/* eslint-disable no-console */
const debug = false

// UTF-8 support https://github.com/Philippe64
// https://github.com/exif-js/exif-js/pull/174
/**
 * @param {DataView} buffer
 * @param {number} start
 * @param {number} length
 */
export function getStringFromDB(buffer, start, length) {
  let outstr = ''
  const arOut = []
  let j = 0
  for (let n = start; n < start+length; n++) {
    arOut[j] = '0x' + buffer.getUint8(n).toString(16)
    j++
  }
  outstr = Utf8ArrayToStr(arOut)
  return outstr
}

/**
 * @param {DataView} file
 * @param {number} tiffStart
 * @param {number} dirStart
 */
export function readTags(file, tiffStart, dirStart, strings, bigEnd) {
  const entries = file.getUint16(dirStart, !bigEnd)
  const tags = {}
  let entryOffset, tag, i

  for (i=0; i<entries; i++) {
    entryOffset = dirStart + i*12 + 2
    tag = strings[file.getUint16(entryOffset, !bigEnd)]
    if (!tag && debug) console.log('Unknown tag: ' + file.getUint16(entryOffset, !bigEnd))
    tags[tag] = readTagValue(file, entryOffset, tiffStart, bigEnd)
  }
  return tags
}

/**
 * @param {DataView} file
 * @param {number} entryOffset
 * @param {number} tiffStart
 * @param {number} bigEnd
 */
function readTagValue(file, entryOffset, tiffStart, bigEnd) {
  const type = file.getUint16(entryOffset+2, !bigEnd)
  const numValues = file.getUint32(entryOffset+4, !bigEnd)
  const valueOffset = file.getUint32(entryOffset+8, !bigEnd) + tiffStart

  let offset, vals, val, n, numerator, denominator

  switch (type) {
  case 1: // byte, 8-bit unsigned int
  case 7: // undefined, 8-bit byte, value depending on field
    if (numValues == 1) {
      return file.getUint8(entryOffset + 8)
    } else {
      offset = numValues > 4 ? valueOffset: (entryOffset + 8)
      vals = []
      for (n=0;n<numValues;n++) {
        vals[n] = file.getUint8(offset + n)
      }
      return vals
    }

  case 2: // ascii, 8-bit byte
    offset = numValues > 4 ? valueOffset: (entryOffset + 8)
    return getStringFromDB(file, offset, numValues-1)

  case 3: // short, 16 bit int
    if (numValues == 1) {
      return file.getUint16(entryOffset + 8, !bigEnd)
    } else {
      offset = numValues > 2 ? valueOffset: (entryOffset + 8)
      vals = []
      for (n=0;n<numValues;n++) {
        vals[n] = file.getUint16(offset + 2*n, !bigEnd)
      }
      return vals
    }

  case 4: // long, 32 bit int
    if (numValues == 1) {
      return file.getUint32(entryOffset + 8, !bigEnd)
    } else {
      vals = []
      for (n=0;n<numValues;n++) {
        vals[n] = file.getUint32(valueOffset + 4*n, !bigEnd)
      }
      return vals
    }

  case 5:    // rational = two long values, first is numerator, second is denominator
    if (numValues == 1) {
      numerator = file.getUint32(valueOffset, !bigEnd)
      denominator = file.getUint32(valueOffset+4, !bigEnd)
      val = new Number(numerator / denominator)
      val.numerator = numerator
      val.denominator = denominator
      return val
    } else {
      vals = []
      for (n=0;n<numValues;n++) {
        numerator = file.getUint32(valueOffset + 8*n, !bigEnd)
        denominator = file.getUint32(valueOffset+4 + 8*n, !bigEnd)
        vals[n] = new Number(numerator / denominator)
        vals[n].numerator = numerator
        vals[n].denominator = denominator
      }
      return vals
    }

  case 9: // slong, 32 bit signed int
    if (numValues == 1) {
      return file.getInt32(entryOffset + 8, !bigEnd)
    } else {
      vals = []
      for (n=0;n<numValues;n++) {
        vals[n] = file.getInt32(valueOffset + 4*n, !bigEnd)
      }
      return vals
    }

  case 10: // signed rational, two slongs, first is numerator, second is denominator
    if (numValues == 1) {
      return file.getInt32(valueOffset, !bigEnd) / file.getInt32(valueOffset+4, !bigEnd)
    } else {
      vals = []
      for (n=0;n<numValues;n++) {
        vals[n] = file.getInt32(valueOffset + 8*n, !bigEnd) / file.getInt32(valueOffset+4 + 8*n, !bigEnd)
      }
      return vals
    }
  }
}

// https://github.com/exif-js/exif-js/pull/174/files
// adopted from:
// http://www.onicos.com/staff/iz/amuse/javascript/expert/utf.txt
/* utf.js - UTF-8 <=> UTF-16 convertion
 * Copyright (C) 1999 Masanao Izumo <iz@onicos.co.jp>
 */
/**
 * @param {Array<string>} array
 */
export const Utf8ArrayToStr = (array) => {
  var out, i, c
  var char2, char3

  out = ''
  const len = array.length
  i = 0
  while(i < len) {
    c = array[i++]
    switch(c >> 4)
    {
    case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
    // 0xxxxxxx
      out += String.fromCharCode(c)
      break
    case 12: case 13:
    // 110x xxxx   10xx xxxx
      char2 = array[i++]
      out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F))
      break
    case 14:
    // 1110 xxxx  10xx xxxx  10xx xxxx
      char2 = array[i++]
      char3 = array[i++]
      out += String.fromCharCode(((c & 0x0F) << 12) |
              ((char2 & 0x3F) << 6) |
              ((char3 & 0x3F) << 0))
      break
    }
  }

  return out
}