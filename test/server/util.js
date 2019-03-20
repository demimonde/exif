/* eslint-env browser */
window.loadImage = async (path) => {
  return await new Promise((r, j) => {
    const xhr = new XMLHttpRequest()

    xhr.open('GET', path, true)
    xhr.responseType = 'arraybuffer'

    xhr.onload = function() {
      r(this.response)
    }
    xhr.onerror = j

    xhr.send()
  })
}