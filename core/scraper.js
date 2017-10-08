const system = require('system')
const webpage = require('webpage')

const {fps, size} = require('../config')

const [_, url] = system.args
const stdout = '/dev/stdout'
const frames = 1000 / fps

if (!url) {
  phantom.exit()
  throw new Error('scraper: url is missing! usage: phantomjs scraper.js [url]')
}

const page = webpage.create()
page.viewportSize = size

const render = () =>
  setInterval(() => page.render(stdout, {format: 'png'}), frames)

page.open(url, render)
