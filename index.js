const VideoStream = require('./core/stream')
const facebook = require('./core/facebook')
const renderScreen = require('./core/screen')
const {fps, logFile, fbUID, title, privacy} = require('./config')

const accessToken = process.env.FB_ACCESS_TOKEN

let streamProcess = null
let postId = null

if (!accessToken) throw new Error('FB_ACCESS_TOKEN not given!')

const privacies = {
  public: "{'value': 'EVERYONE'}",
  friends: "{'value': 'ALL_FRIENDS'}",
  friends_of_friends: "{'value': 'FRIENDS_OF_FRIENDS'}",
  private: `{'value':'CUSTOM', allow:'${fbUID}'}`
}

const options = {accessToken, title, privacy: privacies[privacy]}

async function start() {
  const {stream_url, id} = await facebook.startLiveVideo(options)
  postId = id

  console.info('Facebook Live ID is', id)
  console.info('Stream URL is', stream_url)

  const stream = new VideoStream(stream_url)
  const stop = await renderScreen(id, accessToken, stream)
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
process.on('unhandledRejection', err => exitHandler({exit: true}, err))

start()
