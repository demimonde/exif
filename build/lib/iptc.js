/* eslint-disable no-console */
const { getStringFromDB } = require('./');

const debug = false

/**
 * @param {ArrayBuffer} file
 */
               function findIPTCinJPEG(file) {
  const dataView = new DataView(file)

  if (debug) console.log('Got file of length %s', file.byteLength)
  if ((dataView.getUint8(0) != 0xFF) || (dataView.getUint8(1) != 0xD8)) {
    if (debug) console.log('Not a valid JPEG')
    return false // not a valid jpeg
  }

  let offset = 2,
    length = file.byteLength

  while (offset < length) {
    if (isFieldSegmentStart(dataView, offset )){
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

// https://www.sno.phy.queensu.ca/~phil/exiftool/TagNames/IPTC.html
const IptcFieldMap = {
  [120]: 'Caption-Abstract', // string[0,2000]
  [110]: 'Credit', // string[0,32]
  [25]: 'Keywords', // string[0,64]+
  [55]: 'DateCreated', // digits[8]
  [80]: 'By-line', // string[0,32]+
  [85]: 'By-lineTitle', // string[0,32]+
  [122]: 'Writer-Editor', // string[0,32]+
  [105]: 'Headline', // string[0,256]
  [116]: 'CopyrightNotice', // string[0,128]
  [15]: 'Category', // string[0,3]
}

function readIPTCData(file, startOffset, sectionLength){
  const dataView = new DataView(file)
  var data = {}
  let fieldValue, fieldName, dataSize, segmentType
  let segmentStartPos = startOffset
  while(segmentStartPos < startOffset + sectionLength) {
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

function isFieldSegmentStart(dataView, offset){
  return (
    dataView.getUint8(offset) === 0x38 &&
    dataView.getUint8(offset+1) === 0x42 &&
    dataView.getUint8(offset+2) === 0x49 &&
    dataView.getUint8(offset+3) === 0x4D &&
    dataView.getUint8(offset+4) === 0x04 &&
    dataView.getUint8(offset+5) === 0x04
  )
}

module.exports = findIPTCinJPEG