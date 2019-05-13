/* eslint-disable no-console */
import readThumbnailImage from './thumbnail'
import TiffTags from '../tags/tiff'
import ExifTags from '../tags/exif'
import GPSTags from '../tags/gps'
import { getStringFromDB, readTags } from './'
import { dms2dd, getDate } from './util'

const debug = false

/**
 * @param {!ArrayBuffer} file
 * @param {!_exif.HandleBinaryFile} [config]
 */
export function findEXIFinJPEG(file, config) {
  const dataView = new DataView(file)

  if (debug) console.log('Got file of length ' + file.byteLength)
  if ((dataView.getUint8(0) != 0xFF) || (dataView.getUint8(1) != 0xD8)) {
    if (debug) console.log('Not a valid JPEG')
    return false // not a valid jpeg
  }

  const length = file.byteLength
  let offset = 2, marker

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

      return readEXIFData(dataView, offset + 4, config)

      // offset += 2 + file.getShortAt(offset+2, true);
    } else {
      offset += 2 + dataView.getUint16(offset+2)
    }
  }
}

/**
 * @param {!DataView} file
 * @param {number} start
 * @param {!_exif.HandleBinaryFile} [config]
 */
function readEXIFData(file, start, config = {}) {
  const { coordinates = 'dms', parseDates = false } = config
  if (getStringFromDB(file, start, 4) != 'Exif') {
    if (debug) console.log('Not valid EXIF data! ' + getStringFromDB(file, start, 4))
    return false
  }

  const tiffOffset = start + 6
  let bigEnd
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

  const firstIFDOffset = file.getUint32(tiffOffset+4, !bigEnd)

  if (firstIFDOffset < 0x00000008) {
    if (debug) console.log('Not valid TIFF data! (First offset less than 8)', file.getUint32(tiffOffset+4, !bigEnd))
    return false
  }

  const tags = readTags(file, tiffOffset, tiffOffset + firstIFDOffset, TiffTags, bigEnd)

  if (parseDates && tags['DateTime']) {
    tags['DateTime'] = getDate(tags['DateTime'])
  }

  let tagName
  const {
    'ExifIFDPointer': ExifIFDPointer,
    'GPSInfoIFDPointer': GPSInfoIFDPointer,
  } = tags
  if (ExifIFDPointer) {
    const exifData = readTags(file, tiffOffset, tiffOffset + ExifIFDPointer, ExifTags, bigEnd)
    for (tagName in exifData) {
      let tag = exifData[tagName]
      switch (tagName) {
      case 'LightSource':
      case 'Flash':
      case 'MeteringMode':
      case 'ExposureProgram':
      case 'SensingMethod':
      case 'SceneCaptureType':
      case 'SceneType':
      case 'CustomRendered':
      case 'WhiteBalance':
      case 'GainControl':
      case 'Contrast':
      case 'Saturation':
      case 'Sharpness':
      case 'SubjectDistanceRange':
      case 'FileSource':
        tag = StringValues[tagName][tag]
        break
      case 'DateTimeOriginal':
      case 'DateTimeDigitized':
        if (parseDates) {
          tag = getDate(tag)
        }
        break
      case 'ExifVersion':
      case 'FlashpixVersion':
        tag = String.fromCharCode(tag[0], tag[1], tag[2], tag[3])
        break

      case 'ComponentsConfiguration':
        tag =
          StringValues.Components[tag[0]] +
          StringValues.Components[tag[1]] +
          StringValues.Components[tag[2]] +
          StringValues.Components[tag[3]]
        break
      }
      tags[tagName] = tag
    }
  }

  if (GPSInfoIFDPointer) {
    const gpsData = readTags(file, tiffOffset, tiffOffset + GPSInfoIFDPointer, GPSTags, bigEnd)
    for (tagName in gpsData) {
      let tag = gpsData[tagName]
      switch (tagName) {
      case 'GPSVersionID': {
        const [t,t1,t2,t3] = tag
        tag = [t,t1,t2,t3].join('.')
        break
      }}
      tags[tagName] = tag
    }
    if (coordinates == 'dd') {
      if (tags['GPSLongitude']) {
        const [deg,min,sec] = tags['GPSLongitude']
        tags['GPSLongitude'] = dms2dd(deg, min, sec, tags['GPSLongitudeRef'])
      }
      if (tags['GPSLatitude']) {
        const [deg,min,sec] = tags['GPSLatitude']
        tags['GPSLatitude'] = dms2dd(deg, min, sec, tags['GPSLatitudeRef'])
      }
    }
  }

  tags['thumbnail'] = readThumbnailImage(file, tiffOffset, firstIFDOffset, bigEnd)

  return tags
}

const StringValues = {
  'ExposureProgram': {
    [0]: 'Not defined',
    [1]: 'Manual',
    [2]: 'Normal program',
    [3]: 'Aperture priority',
    [4]: 'Shutter priority',
    [5]: 'Creative program',
    [6]: 'Action program',
    [7]: 'Portrait mode',
    [8]: 'Landscape mode',
  },
  'MeteringMode': {
    [0]: 'Unknown',
    [1]: 'Average',
    [2]: 'CenterWeightedAverage',
    [3]: 'Spot',
    [4]: 'MultiSpot',
    [5]: 'Pattern',
    [6]: 'Partial',
    [255]: 'Other',
  },
  'LightSource': {
    [0]: 'Unknown',
    [1]: 'Daylight',
    [2]: 'Fluorescent',
    [3]: 'Tungsten (incandescent light)',
    [4]: 'Flash',
    [9]: 'Fine weather',
    [10]: 'Cloudy weather',
    [11]: 'Shade',
    [12]: 'Daylight fluorescent (D 5700 - 7100K)',
    [13]: 'Day white fluorescent (N 4600 - 5400K)',
    [14]: 'Cool white fluorescent (W 3900 - 4500K)',
    [15]: 'White fluorescent (WW 3200 - 3700K)',
    [17]: 'Standard light A',
    [18]: 'Standard light B',
    [19]: 'Standard light C',
    [20]: 'D55',
    [21]: 'D65',
    [22]: 'D75',
    [23]: 'D50',
    [24]: 'ISO studio tungsten',
    [255]: 'Other',
  },
  'Flash': {
    [0x0000]: 'Flash did not fire',
    [0x0001]: 'Flash fired',
    [0x0005]: 'Strobe return light not detected',
    [0x0007]: 'Strobe return light detected',
    [0x0009]: 'Flash fired, compulsory flash mode',
    [0x000D]: 'Flash fired, compulsory flash mode, return light not detected',
    [0x000F]: 'Flash fired, compulsory flash mode, return light detected',
    [0x0010]: 'Flash did not fire, compulsory flash mode',
    [0x0018]: 'Flash did not fire, auto mode',
    [0x0019]: 'Flash fired, auto mode',
    [0x001D]: 'Flash fired, auto mode, return light not detected',
    [0x001F]: 'Flash fired, auto mode, return light detected',
    [0x0020]: 'No flash function',
    [0x0041]: 'Flash fired, red-eye reduction mode',
    [0x0045]: 'Flash fired, red-eye reduction mode, return light not detected',
    [0x0047]: 'Flash fired, red-eye reduction mode, return light detected',
    [0x0049]: 'Flash fired, compulsory flash mode, red-eye reduction mode',
    [0x004D]: 'Flash fired, compulsory flash mode, red-eye reduction mode, return light not detected',
    [0x004F]: 'Flash fired, compulsory flash mode, red-eye reduction mode, return light detected',
    [0x0059]: 'Flash fired, auto mode, red-eye reduction mode',
    [0x005D]: 'Flash fired, auto mode, return light not detected, red-eye reduction mode',
    [0x005F]: 'Flash fired, auto mode, return light detected, red-eye reduction mode',
  },
  'SensingMethod': {
    [1]: 'Not defined',
    [2]: 'One-chip color area sensor',
    [3]: 'Two-chip color area sensor',
    [4]: 'Three-chip color area sensor',
    [5]: 'Color sequential area sensor',
    [7]: 'Trilinear sensor',
    [8]: 'Color sequential linear sensor',
  },
  'SceneCaptureType': {
    [0]: 'Standard',
    [1]: 'Landscape',
    [2]: 'Portrait',
    [3]: 'Night scene',
  },
  'SceneType': {
    [1]: 'Directly photographed',
  },
  'CustomRendered': {
    [0]: 'Normal process',
    [1]: 'Custom process',
  },
  'WhiteBalance': {
    [0]: 'Auto white balance',
    [1]: 'Manual white balance',
  },
  'GainControl': {
    [0]: 'None',
    [1]: 'Low gain up',
    [2]: 'High gain up',
    [3]: 'Low gain down',
    [4]: 'High gain down',
  },
  'Contrast': {
    [0]: 'Normal',
    [1]: 'Soft',
    [2]: 'Hard',
  },
  'Saturation': {
    [0]: 'Normal',
    [1]: 'Low saturation',
    [2]: 'High saturation',
  },
  'Sharpness': {
    [0]: 'Normal',
    [1]: 'Soft',
    [2]: 'Hard',
  },
  'SubjectDistanceRange': {
    [0]: 'Unknown',
    [1]: 'Macro',
    [2]: 'Close view',
    [3]: 'Distant view',
  },
  'FileSource': {
    [3]: 'DSC',
  },

  Components: {
    [0]: '',
    [1]: 'Y',
    [2]: 'Cb',
    [3]: 'Cr',
    [4]: 'R',
    [5]: 'G',
    [6]: 'B',
  },
}

/**
 * @suppress {nonStandardJsDocs}
 * @typedef {import('../').HandleBinaryFile} _exif.HandleBinaryFile
 */