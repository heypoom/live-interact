const exec = require('child_process').exec

const facebook = require('./core/facebook')

const {fps, logFile, fbUID, title, uiPath, privacy} = require('./config')

const debug = process.env.DEBUG
const accessToken = process.env.FB_ACCESS_TOKEN

const scraper = `${__dirname}/core/scraper.js`

let streamProcess = null
let postId = null

if (!accessToken) {
  throw new Error('FB_ACCESS_TOKEN not given!')
}

const privacys = {
  public: "{'value': 'EVERYONE'}",
  friends: "{'value': 'ALL_FRIENDS'}",
  friends_of_friends: "{'value': 'FRIENDS_OF_FRIENDS'}",
  private: `{'value':'CUSTOM', allow:'${fbUID}'}`
}

const ffmpegFlags = `-threads 0 -y -v verbose -c:v png -r '${fps}' -f image2pipe -i - -f lavfi -i anullsrc -acodec aac -ac 1 -ar 44100 -b:a 128k -c:v libx264 -s 1280x720 -pix_fmt yuv420p -f flv`

const data = {
  accessToken,
  title,
  privacy: privacys[privacy]
}

const getUI = postId =>
  `file://${uiPath}?debug=${debug}&accessToken=${accessToken}&postId=${postId}`

const ffmpeg = rtmpUrl => `ffmpeg ${ffmpegFlags} '${rtmpUrl}'`

const scrape = url => `phantomjs --web-security=no ${scraper} '${url}'`

const getCmd = (url, rtmp) =>
  `${scrape(url)} | ${ffmpeg(rtmp)} >> ${logFile} 2>&1`

const onStream = (error, stdout, stderr) => {
  console.log({error, stdout, stderr})
}

async function start() {
  const {stream_url: rtmpUrl, id, ...rest} = await facebook.startLiveVideo(data)
  const cmd = getCmd(getUI(id), rtmpUrl)

  console.info('Facebook Live ID is', id)
  console.info('Stream URL is', rtmpUrl)

  postId = id
  streamProcess = exec(cmd, onStream)
}

function exitHandler(options, err) {
  if (options.cleanup) {
    if (streamProcess) streamProcess.kill('SIGINT')

    if (accessToken && postId) {
      facebook.endLiveVideo(postId, accessToken)
      // facebook.deleteLiveVideo(postId, accessToken)
    }
  }

  if (err) console.error(err.stack)
  if (options.exit) process.exit()
}

process.on('exit', () => exitHandler({cleanup: true}))
process.on('SIGINT', err => exitHandler({exit: true}, err))
process.on('uncaughtException', err => exitHandler({exit: true}, err))

start()
