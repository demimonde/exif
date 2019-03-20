/* eslint-env browser */
import { handleBinaryFile, getDate } from './src'
const EXIF = {
  'handleBinaryFile': handleBinaryFile,
  'getDate': getDate,
}
window['EXIF']=EXIF