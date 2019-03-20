const findIPTCinJPEG = require('./lib/iptc');
const { findEXIFinJPEG } = require('./lib/exif');

/**
 * Extract metadata from the ArrayBuffer.
 * @param {ArrayBuffer} binFile The file as ArrayBuffer.
 * @param {Config} config Options for the program.
 * @param {boolean} [config.parseDates=false] Parse EXIF dates into JS dates. Default `false`.
 * @param {('dms'|'dd')} [config.coordinates="dms"] Return coordinates either as DMS (degrees, minutes, seconds) or DD (decimal degrees). Default `dms`.
 */
       function handleBinaryFile(binFile, config) {
  const data = findEXIFinJPEG(binFile, config)
  const iptcdata = findIPTCinJPEG(binFile)
  return { 'data': data, 'iptcdata': iptcdata }
}

/* documentary types/index.xml */
/**
 * @typedef {Object} Config Options for the program.
 * @prop {boolean} [parseDates=false] Parse EXIF dates into JS dates. Default `false`.
 * @prop {('dms'|'dd')} [coordinates="dms"] Return coordinates either as DMS (degrees, minutes, seconds) or DD (decimal degrees). Default `dms`.
 */


module.exports.handleBinaryFile = handleBinaryFile