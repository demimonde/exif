/* global loadImage */
import render from '@depack/render'

export default async (ctx) => {
  const { testBuild } = ctx
  const { photo } = ctx.params
  ctx.body = render(<html>
    <head>
      <title>exif test</title>
    </head>
    <body>
      <script src="/test/server/util" />
      {!testBuild && // source code test
        <script type="module" src="/test/server" />}
      {testBuild && // dist test
        <script src="/exif.js"/>}

      <script type={testBuild ? '' : 'module'} dangerouslySetInnerHTML={{
        __html: `${runTest.toString()}
window.test = runTest.bind(null, '/${photo}')
`,
      }} />
    </body>
  </html>, { addDoctype: true, pretty: true })
}

async function runTest(image) {
  const res = await loadImage(image)
  return JSON.stringify(window.EXIF.handleBinaryFile(res))
  // return res
}

export const aliases = ['/', '/test/:photo?']