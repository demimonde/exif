/* yarn example/ */
import exif from '../src'

(async () => {
  const res = await exif({
    text: 'example',
  })
  console.log(res)
})()