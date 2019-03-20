// Stanko Milosev
// http://www.milosev.com/425-reading-exif-meta-data-from-jpeg-image-files.html
/**
 * Converts Degrees to numerical coordinates.
 */
export const dms2dd = (deg, min, sec, dir) => {
  const dd = deg + min/60 + sec/(60*60)
  const i = (dir == 'S' || dir == 'W') ? -1 : 1
  return dd * i
}

// RobG
// https://stackoverflow.com/a/43084928/1267201
/**
 * Converts EXIF date to JS date.
 */
export const getDate = (s) => {
  const [year, month, date, hour, min, sec] = s.split(/\D/)
  return new Date(year, month-1, date, hour, min, sec)
}
