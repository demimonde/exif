import makeTestSuite from '@zoroaster/mask'
import Context from '../context'
import exif from '../../src'

// export default
makeTestSuite('test/result', {
  async getResults(input) {
    const res = await exif({
      text: input,
    })
    return res
  },
  context: Context,
})