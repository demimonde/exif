import core from '@idio/core'
import initRoutes from '@idio/router'
import { c } from 'erte'

const testBuild = process.env.ALAMODE_ENV == 'test-build'
if (testBuild) console.log(c('Testing Depack build...', 'yellow'))

export default class IdioContext {
  async _init() {
    const { app, url, router } = await core({
      frontend: { directory: ['src', 'test/server'] },
      compress: { use: true, config: {
        threshold: 0,
      } },
      static: {
        use: true,
        root: ['test/fixture/images', 'dist'],
      },
    }, { port: 5500 })
    Object.assign(app.context, { testBuild })
    await initRoutes(router, 'test/server/routes')
    app.use(router.routes())
    this.app = app
    this.url = url
  }
  async _destroy() {
    if (this.app)
      await this.app.destroy()
  }
}