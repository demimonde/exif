/* eslint-disable no-console */
const debug = false

/**
 * @param {DataView} buffer
 * @param {number} start
 * @param {number} length
 */
       function getStringFromDB(buffer, start, length) {
  let outstr = ''
  for (let n = start; n < start + length; n++) {
    outstr += String.fromCharCode(buffer.getUint8(n))
  }
  return outstr
}

/**
 * @param {DataView} file
 * @param {number} tiffStart
 * @param {number} dirStart
 */
       function readTags(file, tiffStart, dirStart, strings, bigEnd) {
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

module.exports.getStringFromDB = getStringFromDB
module.exports.readTags = readTags