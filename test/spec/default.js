import Context from '../context'
import { handleBinaryFile } from '../../src'

/** @type {Object.<string, (c: Context)>} */
const T = {
  persistentContext: Context,
  async 'handles a JPG file'({ photo }) {
    const res = handleBinaryFile(photo)
    return JSON.parse(JSON.stringify(res))
  },
  async 'returns dd coordinates'({ photo }) {
    const { data: {
      GPSLatitude,
      GPSLongitude,
    } } = handleBinaryFile(photo, {
      coordinates: 'dd',
    })
    return { GPSLatitude, GPSLongitude }
  },
  async 'parses dates'({ photo }) {
    const { data: {
      DateTime,
      DateTimeOriginal,
      DateTimeDigitized,
    } } = handleBinaryFile(photo, {
      parseDates: true,
    })
    return {
      DateTime: DateTime.toISOString(),
      DateTimeOriginal: DateTimeOriginal.toISOString(),
      DateTimeDigitized: DateTimeDigitized.toISOString(),
    }
  },
  async 'gets a link to the fixture'({ FIXTURE }) {
    // const res = await exif({
    //   text: FIXTURE,
    // })
    // ok(res, FIXTURE)
  },
}

export default T