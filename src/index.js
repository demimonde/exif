/* eslint-disable no-console */
// import GPSTags from './tags/gps'
// import TiffTags from './tags/tiff'
// import ExifTags from './tags/exif'
import findIPTCinJPEG from './lib/iptc'
import { findEXIFinJPEG } from './lib/exif'

/**
 * @param {ArrayBuffer} binFile
 */
export function handleBinaryFile(binFile) {
  const data = findEXIFinJPEG(binFile)
  const iptcdata = findIPTCinJPEG(binFile)
  return { data, iptcdata }
}