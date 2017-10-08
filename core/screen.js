const puppeteer = require('puppeteer')
const {fps, size, uiPath} = require('../config')

const debug = process.env.DEBUG === 'true'

async function renderScreen(id, token, stream) {
  if (!id) throw new Error('Missing Video ID!')

  const screenURL = `file://${uiPath}?debug=${debug}&accessToken=${token}&postId=${id}`
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  await page.setViewport(size)
  await page.goto(screenURL)

  const loop = setInterval(async () => {
    const buffer = await page.screenshot()
    stream.write(buffer)
  }, 1000 / fps)

  return async function stop(code) {
    await clearInterval(loop)
    await browser.close()
  }
}

module.exports = renderScreen
