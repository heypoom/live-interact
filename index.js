const VideoStream = require('./core/stream')
const {privacies, ...Facebook} = require('./core/facebook')
const renderScreen = require('./core/screen')
const {fps, logFile, title, privacy, removeClip} = require('./config')

const accessToken = process.env.FB_ACCESS_TOKEN

let streamProcess = null
let postId = null

if (!accessToken) throw new Error('FB_ACCESS_TOKEN not given!')

const options = {accessToken, title, privacy: privacies[privacy]}

async function start() {
  const {stream_url, id} = await Facebook.startLiveVideo(options)
  postId = id

  console.info('Facebook Live ID is', id)
  console.info('Stream URL is', stream_url)

  const stream = VideoStream(stream_url)
  const stop = await renderScreen(id, accessToken, stream.write)
}

function exitHandler(options, err) {
  if (options.cleanup) {
    if (streamProcess) streamProcess.kill('SIGINT')

    if (accessToken && postId) {
      Facebook.endLiveVideo(postId, accessToken)

      if (removeClip) Facebook.deleteLiveVideo(postId, accessToken)
    }
  }

  if (err) console.error(err.stack)
  if (options.exit) process.exit()
}

process.on('exit', () => exitHandler({cleanup: true}))
process.on('SIGINT', err => exitHandler({exit: true}, err))
process.on('uncaughtException', err => exitHandler({exit: true}, err))
process.on('unhandledRejection', err => exitHandler({exit: true}, err))

start()
