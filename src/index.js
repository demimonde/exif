/* eslint-env browser */
/* eslint-disable no-console */
import GPSTags from './tags/gps'
import IFD1Tags from './tags/ifd1'
import TiffTags from './tags/tiff'
import ExifTags from './tags/exif'

const debug = false

const StringValues = {
  ExposureProgram: {
    0: 'Not defined',
    1: 'Manual',
    2: 'Normal program',
    3: 'Aperture priority',
    4: 'Shutter priority',
    5: 'Creative program',
    6: 'Action program',
    7: 'Portrait mode',
    8: 'Landscape mode',
  },
  MeteringMode: {
    0: 'Unknown',
    1: 'Average',
    2: 'CenterWeightedAverage',
    3: 'Spot',
    4: 'MultiSpot',
    5: 'Pattern',
    6: 'Partial',
    255: 'Other',
  },
  LightSource: {
    0: 'Unknown',
    1: 'Daylight',
    2: 'Fluorescent',
    3: 'Tungsten (incandescent light)',
    4: 'Flash',
    9: 'Fine weather',
    10: 'Cloudy weather',
    11: 'Shade',
    12: 'Daylight fluorescent (D 5700 - 7100K)',
    13: 'Day white fluorescent (N 4600 - 5400K)',
    14: 'Cool white fluorescent (W 3900 - 4500K)',
    15: 'White fluorescent (WW 3200 - 3700K)',
    17: 'Standard light A',
    18: 'Standard light B',
    19: 'Standard light C',
    20: 'D55',
    21: 'D65',
    22: 'D75',
    23: 'D50',
    24: 'ISO studio tungsten',
    255: 'Other',
  },
  Flash: {
    0x0000: 'Flash did not fire',
    0x0001: 'Flash fired',
    0x0005: 'Strobe return light not detected',
    0x0007: 'Strobe return light detected',
    0x0009: 'Flash fired, compulsory flash mode',
    0x000D: 'Flash fired, compulsory flash mode, return light not detected',
    0x000F: 'Flash fired, compulsory flash mode, return light detected',
    0x0010: 'Flash did not fire, compulsory flash mode',
    0x0018: 'Flash did not fire, auto mode',
    0x0019: 'Flash fired, auto mode',
    0x001D: 'Flash fired, auto mode, return light not detected',
    0x001F: 'Flash fired, auto mode, return light detected',
    0x0020: 'No flash function',
    0x0041: 'Flash fired, red-eye reduction mode',
    0x0045: 'Flash fired, red-eye reduction mode, return light not detected',
    0x0047: 'Flash fired, red-eye reduction mode, return light detected',
    0x0049: 'Flash fired, compulsory flash mode, red-eye reduction mode',
    0x004D: 'Flash fired, compulsory flash mode, red-eye reduction mode, return light not detected',
    0x004F: 'Flash fired, compulsory flash mode, red-eye reduction mode, return light detected',
    0x0059: 'Flash fired, auto mode, red-eye reduction mode',
    0x005D: 'Flash fired, auto mode, return light not detected, red-eye reduction mode',
    0x005F: 'Flash fired, auto mode, return light detected, red-eye reduction mode',
  },
  SensingMethod: {
    1: 'Not defined',
    2: 'One-chip color area sensor',
    3: 'Two-chip color area sensor',
    4: 'Three-chip color area sensor',
    5: 'Color sequential area sensor',
    7: 'Trilinear sensor',
    8: 'Color sequential linear sensor',
  },
  SceneCaptureType: {
    0: 'Standard',
    1: 'Landscape',
    2: 'Portrait',
    3: 'Night scene',
  },
  SceneType: {
    1: 'Directly photographed',
  },
  CustomRendered: {
    0: 'Normal process',
    1: 'Custom process',
  },
  WhiteBalance: {
    0: 'Auto white balance',
    1: 'Manual white balance',
  },
  GainControl: {
    0: 'None',
    1: 'Low gain up',
    2: 'High gain up',
    3: 'Low gain down',
    4: 'High gain down',
  },
  Contrast: {
    0: 'Normal',
    1: 'Soft',
    2: 'Hard',
  },
  Saturation: {
    0: 'Normal',
    1: 'Low saturation',
    2: 'High saturation',
  },
  Sharpness: {
    0: 'Normal',
    1: 'Soft',
    2: 'Hard',
  },
  SubjectDistanceRange: {
    0: 'Unknown',
    1: 'Macro',
    2: 'Close view',
    3: 'Distant view',
  },
  FileSource: {
    3: 'DSC',
  },

  Components: {
    0: '',
    1: 'Y',
    2: 'Cb',
    3: 'Cr',
    4: 'R',
    5: 'G',
    6: 'B',
  },
}

/**
 * @param {ArrayBuffer} binFile
 */
export function handleBinaryFile(binFile) {
  const data = findEXIFinJPEG(binFile)
  const iptcdata = findIPTCinJPEG(binFile)
  return { data, iptcdata }
}

/**
 * @param {ArrayBuffer} file
 */
function findEXIFinJPEG(file) {
  var dataView = new DataView(file)

  if (debug) console.log('Got file of length ' + file.byteLength)
  if ((dataView.getUint8(0) != 0xFF) || (dataView.getUint8(1) != 0xD8)) {
    if (debug) console.log('Not a valid JPEG')
    return false // not a valid jpeg
  }

  var offset = 2,
    length = file.byteLength,
    marker

  while (offset < length) {
    if (dataView.getUint8(offset) != 0xFF) {
      if (debug) console.log('Not a valid marker at offset ' + offset + ', found: ' + dataView.getUint8(offset))
      return false // not a valid marker, something is wrong
    }

    marker = dataView.getUint8(offset + 1)
    if (debug) console.log(marker)

    // we could implement handling for other markers here,
    // but we're only looking for 0xFFE1 for EXIF data

    if (marker == 225) {
      if (debug) console.log('Found 0xFFE1 marker')

      return readEXIFData(dataView, offset + 4, dataView.getUint16(offset + 2) - 2)

      // offset += 2 + file.getShortAt(offset+2, true);
    } else {
      offset += 2 + dataView.getUint16(offset+2)
    }
  }
}

var isFieldSegmentStart = function(dataView, offset){
  return (
    dataView.getUint8(offset) === 0x38 &&
          dataView.getUint8(offset+1) === 0x42 &&
          dataView.getUint8(offset+2) === 0x49 &&
          dataView.getUint8(offset+3) === 0x4D &&
          dataView.getUint8(offset+4) === 0x04 &&
          dataView.getUint8(offset+5) === 0x04
  )
}

/**
 * @param {ArrayBuffer} file
 */
function findIPTCinJPEG(file) {
  var dataView = new DataView(file)

  if (debug) console.log('Got file of length ' + file.byteLength)
  if ((dataView.getUint8(0) != 0xFF) || (dataView.getUint8(1) != 0xD8)) {
    if (debug) console.log('Not a valid JPEG')
    return false // not a valid jpeg
  }

  var offset = 2,
    length = file.byteLength

  while (offset < length) {
    if ( isFieldSegmentStart(dataView, offset )){
      // Get the length of the name header (which is padded to an even number of bytes)
      var nameHeaderLength = dataView.getUint8(offset+7)
      if(nameHeaderLength % 2 !== 0) nameHeaderLength += 1
      // Check for pre photoshop 6 format
      if(nameHeaderLength === 0) {
        // Always 4
        nameHeaderLength = 4
      }

      var startOffset = offset + 8 + nameHeaderLength
      var sectionLength = dataView.getUint16(offset + 6 + nameHeaderLength)

      return readIPTCData(file, startOffset, sectionLength)
    }


    // Not the marker, continue searching
    offset++
  }
}
var IptcFieldMap = {
  0x78: 'caption',
  0x6E: 'credit',
  0x19: 'keywords',
  0x37: 'dateCreated',
  0x50: 'byline',
  0x55: 'bylineTitle',
  0x7A: 'captionWriter',
  0x69: 'headline',
  0x74: 'copyright',
  0x0F: 'category',
}


function readIPTCData(file, startOffset, sectionLength){
  var dataView = new DataView(file)
  var data = {}
  var fieldValue, fieldName, dataSize, segmentType
  var segmentStartPos = startOffset
  while(segmentStartPos < startOffset+sectionLength) {
    if(dataView.getUint8(segmentStartPos) === 0x1C && dataView.getUint8(segmentStartPos+1) === 0x02){
      segmentType = dataView.getUint8(segmentStartPos+2)
      if(segmentType in IptcFieldMap) {
        dataSize = dataView.getInt16(segmentStartPos+3)
        fieldName = IptcFieldMap[segmentType]
        fieldValue = getStringFromDB(dataView, segmentStartPos+5, dataSize)
        // Check if we already stored a value with this name
        if(data.hasOwnProperty(fieldName)) {
          // Value already stored with this name, create multivalue field
          if(data[fieldName] instanceof Array) {
            data[fieldName].push(fieldValue)
          }
          else {
            data[fieldName] = [data[fieldName], fieldValue]
          }
        }
        else {
          data[fieldName] = fieldValue
        }
      }
    }
    segmentStartPos++
  }
  return data
}

/**
 * @param {DataView} file
 * @param {number} tiffStart
 * @param {number} dirStart
 */
function readTags(file, tiffStart, dirStart, strings, bigEnd) {
  var entries = file.getUint16(dirStart, !bigEnd),
    tags = {},
    entryOffset, tag,
    i

  for (i=0;i<entries;i++) {
    entryOffset = dirStart + i*12 + 2
    tag = strings[file.getUint16(entryOffset, !bigEnd)]
    if (!tag && debug) console.log('Unknown tag: ' + file.getUint16(entryOffset, !bigEnd))
    tags[tag] = readTagValue(file, entryOffset, tiffStart, dirStart, bigEnd)
  }
  return tags
}

/**
 * @param {DataView} file
 * @param {number} entryOffset
 * @param {number} tiffStart
 * @param {number} tiffStart
 * @param {number} bigEnd
 */
function readTagValue(file, entryOffset, tiffStart, dirStart, bigEnd) {
  var type = file.getUint16(entryOffset+2, !bigEnd),
    numValues = file.getUint32(entryOffset+4, !bigEnd),
    valueOffset = file.getUint32(entryOffset+8, !bigEnd) + tiffStart,
    offset,
    vals, val, n,
    numerator, denominator

  switch (type) {
  case 1: // byte, 8-bit unsigned int
  case 7: // undefined, 8-bit byte, value depending on field
    if (numValues == 1) {
      return file.getUint8(entryOffset + 8, !bigEnd)
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

/**
 * Given an IFD (Image File Directory) start offset
 * returns an offset to next IFD or 0 if it's the last IFD.
 * @param {DataView} dataView
 */
function getNextIFDOffset(dataView, dirStart, bigEnd){
  //the first 2bytes means the number of directory entries contains in this IFD
  var entries = dataView.getUint16(dirStart, !bigEnd)

  // After last directory entry, there is a 4bytes of data,
  // it means an offset to next IFD.
  // If its value is '0x00000000', it means this is the last IFD and there is no linked IFD.

  return dataView.getUint32(dirStart + 2 + entries * 12, !bigEnd) // each entry is 12 bytes long
}

/**
 * @param {DataView} dataView
 * @param {number} tiffStart
 * @param {number} firstIFDOffset
 * @param {number} bigEnd
 */
function readThumbnailImage(dataView, tiffStart, firstIFDOffset, bigEnd){
  // get the IFD1 offset
  var IFD1OffsetPointer = getNextIFDOffset(dataView, tiffStart+firstIFDOffset, bigEnd)

  if (!IFD1OffsetPointer) {
    // console.log('******** IFD1Offset is empty, image thumb not found ********');
    return {}
  }
  else if (IFD1OffsetPointer > dataView.byteLength) { // this should not happen
    // console.log('******** IFD1Offset is outside the bounds of the DataView ********');
    return {}
  }
  // console.log('*******  thumbnail IFD offset (IFD1) is: %s', IFD1OffsetPointer);

  var thumbTags = readTags(dataView, tiffStart, tiffStart + IFD1OffsetPointer, IFD1Tags, bigEnd)

  // EXIF 2.3 specification for JPEG format thumbnail

  // If the value of Compression(0x0103) Tag in IFD1 is '6', thumbnail image format is JPEG.
  // Most of Exif image uses JPEG format for thumbnail. In that case, you can get offset of thumbnail
  // by JpegIFOffset(0x0201) Tag in IFD1, size of thumbnail by JpegIFByteCount(0x0202) Tag.
  // Data format is ordinary JPEG format, starts from 0xFFD8 and ends by 0xFFD9. It seems that
  // JPEG format and 160x120pixels of size are recommended thumbnail format for Exif2.1 or later.

  if (thumbTags['Compression']) {
    // console.log('Thumbnail image found!');

    switch (thumbTags['Compression']) {
    case 6:
      // console.log('Thumbnail image format is JPEG');
      if (thumbTags.JpegIFOffset && thumbTags.JpegIFByteCount) {
        // extract the thumbnail
        var tOffset = tiffStart + thumbTags.JpegIFOffset
        var tLength = thumbTags.JpegIFByteCount
        thumbTags['blob'] = new Blob([new Uint8Array(dataView.buffer, tOffset, tLength)], {
          type: 'image/jpeg',
        })
      }
      break

    case 1:
      console.log('Thumbnail image format is TIFF, which is not implemented.')
      break
    default:
      console.log('Unknown thumbnail image format \'%s\'', thumbTags['Compression'])
    }
  }
  else if (thumbTags['PhotometricInterpretation'] == 2) {
    console.log('Thumbnail image format is RGB, which is not implemented.')
  }
  return thumbTags
}

/**
 * @param {DataView} buffer
 * @param {number} start
 * @param {number} length
 */
function getStringFromDB(buffer, start, length) {
  var outstr = ''
  for (var n = start; n < start+length; n++) {
    outstr += String.fromCharCode(buffer.getUint8(n))
  }
  return outstr
}

/**
 * @param {DataView} file
 * @param {number} start
 */
function readEXIFData(file, start) {
  if (getStringFromDB(file, start, 4) != 'Exif') {
    if (debug) console.log('Not valid EXIF data! ' + getStringFromDB(file, start, 4))
    return false
  }

  var bigEnd,
    tags, tag,
    exifData, gpsData,
    tiffOffset = start + 6

    // test for TIFF validity and endianness
  if (file.getUint16(tiffOffset) == 0x4949) {
    bigEnd = false
  } else if (file.getUint16(tiffOffset) == 0x4D4D) {
    bigEnd = true
  } else {
    if (debug) console.log('Not valid TIFF data! (no 0x4949 or 0x4D4D)')
    return false
  }

  if (file.getUint16(tiffOffset+2, !bigEnd) != 0x002A) {
    if (debug) console.log('Not valid TIFF data! (no 0x002A)')
    return false
  }

  var firstIFDOffset = file.getUint32(tiffOffset+4, !bigEnd)

  if (firstIFDOffset < 0x00000008) {
    if (debug) console.log('Not valid TIFF data! (First offset less than 8)', file.getUint32(tiffOffset+4, !bigEnd))
    return false
  }

  tags = readTags(file, tiffOffset, tiffOffset + firstIFDOffset, TiffTags, bigEnd)

  if (tags.ExifIFDPointer) {
    exifData = readTags(file, tiffOffset, tiffOffset + tags.ExifIFDPointer, ExifTags, bigEnd)
    for (tag in exifData) {
      switch (tag) {
      case 'LightSource' :
      case 'Flash' :
      case 'MeteringMode' :
      case 'ExposureProgram' :
      case 'SensingMethod' :
      case 'SceneCaptureType' :
      case 'SceneType' :
      case 'CustomRendered' :
      case 'WhiteBalance' :
      case 'GainControl' :
      case 'Contrast' :
      case 'Saturation' :
      case 'Sharpness' :
      case 'SubjectDistanceRange' :
      case 'FileSource' :
        exifData[tag] = StringValues[tag][exifData[tag]]
        break

      case 'ExifVersion' :
      case 'FlashpixVersion' :
        exifData[tag] = String.fromCharCode(exifData[tag][0], exifData[tag][1], exifData[tag][2], exifData[tag][3])
        break

      case 'ComponentsConfiguration' :
        exifData[tag] =
                        StringValues.Components[exifData[tag][0]] +
                        StringValues.Components[exifData[tag][1]] +
                        StringValues.Components[exifData[tag][2]] +
                        StringValues.Components[exifData[tag][3]]
        break
      }
      tags[tag] = exifData[tag]
    }
  }

  if (tags.GPSInfoIFDPointer) {
    gpsData = readTags(file, tiffOffset, tiffOffset + tags.GPSInfoIFDPointer, GPSTags, bigEnd)
    for (tag in gpsData) {
      switch (tag) {
      case 'GPSVersionID' :
        gpsData[tag] = gpsData[tag][0] +
                        '.' + gpsData[tag][1] +
                        '.' + gpsData[tag][2] +
                        '.' + gpsData[tag][3]
        break
      }
      tags[tag] = gpsData[tag]
    }
  }

  // extract thumbnail
  tags['thumbnail'] = readThumbnailImage(file, tiffOffset, firstIFDOffset, bigEnd)

  return tags
}