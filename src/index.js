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

// RobG
// https://stackoverflow.com/a/43084928/1267201
/**
 * Converts EXIF date to JS date.
 */
export const getDate = (s) => {
  const [year, month, date, hour, min, sec] = s.split(/\D/)
  return new Date(year,month-1,date,hour,min,sec)
}
