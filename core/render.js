const puppeteer = require('puppeteer')
const {fps, size} = require('../config')

const url = process.argv[2]
const frames = 1000 / fps

let loop = 0

if (!url) {
  console.error('renderer: url is missing! usage: phantomjs renderer.js [url]')
  process.exit()
}

async function start() {
  const browser = await puppeteer.launch()

  async function stop(code) {
    try {
      console.error('Exiting...')
      await clearInterval(loop)
      await browser.close()
      await process.exit(0)
    } catch (err) {}
  }

  try {
    const page = await browser.newPage()
    await page.setViewport(size)
    await page.goto(url)

    loop = setInterval(async () => {
      const rendered = await page.screenshot()
      process.stdout.write(rendered)
    }, frames)
  } catch (err) {
    console.info('Renderer Failure:', err)
  }

  process.on('SIGINT', stop)
  process.on('unhandledRejection', err => console.error(err.message))
}

start()
