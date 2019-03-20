import IdioContext from '../../context/idio'

;(async() => {
  const c = new IdioContext()
  await c._init()
  console.log(c.url)
})()