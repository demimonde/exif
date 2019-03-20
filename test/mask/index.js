import { makeTestSuite } from 'zoroaster'
import Context from '../context'
import exif from '../../src'

const ts = makeTestSuite('test/result', {
  async getResults(input) {
    const res = await exif({
      text: input,
    })
    return res
  },
  context: Context,
})

// export default ts
