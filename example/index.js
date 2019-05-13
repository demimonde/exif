import { inspect } from 'util'
import { readBuffer } from '@wrote/read'
import { handleBinaryFile } from '../src'

(async () => {
  const { buffer: photo } = (await readBuffer('test/fixture/images/photo.jpg'))
  const res = handleBinaryFile(photo, {
    parseDates: true,
    coordinates: 'dms',
  })
  console.log(inspect(res, null, 100))
})()