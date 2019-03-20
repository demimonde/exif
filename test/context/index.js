// import { resolve } from 'path'
// import { debuglog } from 'util'
import { readBuffer } from '@wrote/read'

// const FIXTURE = resolve('test/fixture')

/**
 * A testing context for the package.
 */
export default class Context {
  async _init() {
    this.photo = (await readBuffer('test/fixture/photo.jpg')).buffer
    // LOG('init context')
  }
  /**
   * Path to the fixture file.
   */
  // get FIXTURE() {
  // return join(FIXTURE, 'test.txt')
  // }
  async _destroy() {
    // LOG('destroy context')
  }
}