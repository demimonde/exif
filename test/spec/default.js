import { equal } from 'zoroaster/assert'
import Context from '../context'
import { handleBinaryFile } from '../../src'

/** @type {Object.<string, (c: Context)>} */
const T = {
  persistentContext: Context,
  'is a function'() {
    equal(typeof exif, 'function')
  },
  async 'handles a JPG file'({ photo }) {
    const res = handleBinaryFile(photo)
    return JSON.parse(JSON.stringify(res))
  },
  async 'gets a link to the fixture'({ FIXTURE }) {
    // const res = await exif({
    //   text: FIXTURE,
    // })
    // ok(res, FIXTURE)
  },
}

export default T