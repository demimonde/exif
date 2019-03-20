import { equal, ok } from 'zoroaster/assert'
import Context from '../context'
import exif from '../../src'

/** @type {Object.<string, (c: Context)>} */
const T = {
  context: Context,
  'is a function'() {
    equal(typeof exif, 'function')
  },
  async 'calls package without error'() {
    await exif()
  },
  async 'gets a link to the fixture'({ FIXTURE }) {
    const res = await exif({
      text: FIXTURE,
    })
    ok(res, FIXTURE)
  },
}

export default T