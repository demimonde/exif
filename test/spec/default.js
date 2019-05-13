import Context from '../context'
import Zoroaster from 'zoroaster'
import { handleBinaryFile } from '../../src'

/** @type {Object.<string, (c: Context)>} */
const T = {
  context: class C extends Zoroaster {
    static serialise(obj) {
      return JSON.parse(JSON.stringify(obj))
      // return Object.keys(obj).reduce((acc, key) => {
      //   const val = obj[key]
      //   if (val instanceof Date) {
      //     acc[key] = val.toISOString()
      //   } else if (val instanceof Number) {
      //     acc[key] = parseInt(val)
      //   } else if (Array.isArray(val)) {
      //     acc[key] = val
      //   } else if (typeof val == 'object') {
      //     acc[key] = C.serialise(val)
      //   }
      //   else acc[key] = val
      //   return acc
      // }, {})
    }
  },
  persistentContext: Context,
  async 'handles a JPG file'({ photo }) {
    const res = handleBinaryFile(photo)
    return res
    // return JSON.parse(JSON.stringify(res))
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
      DateTime, DateTimeOriginal, DateTimeDigitized,
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