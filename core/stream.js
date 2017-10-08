const {PassThrough} = require('stream')
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
const ffmpeg = require('fluent-ffmpeg')

const {fps, logFile, size} = require('../config')

ffmpeg.setFfmpegPath(ffmpegPath)

// Custom FFMPEG Flags
// prettier-ignore
const customFlags = [
  '-threads', '0',  // Threads: 0
  '-y',             // Replace Existing File
  '-v', 'verbose',  // Logging Level: Verbose
]

// FMPEG Encoder
function Encoder(input, output) {
  // Video Input
  // Codec: PNG
  // Format: Image to Pipe
  const vInput = ffmpeg(input)
    .inputOptions(customFlags)
    .inputOptions('-c:v', 'png')
    .inputFPS(fps)
    .inputFormat('image2pipe')

  // Audio Settings
  // Source: Null Audio Source
  // Input Format: LibAV Virtual Input
  const vAudio = vInput
    .input('anullsrc')
    .inputFormat('lavfi')
    .audioCodec('aac')
    .audioChannels(1)
    .audioFrequency(44100)
    .audioBitrate(128)

  // Video Output
  // Codec: H264 (libx264)
  // Pix Format: YUV420P
  // Output: RTMP Stream to Facebook Live
  const vOutput = vAudio
    .addOption('-c:v', 'libx264')
    .size(`${size.width}x${size.height}`)
    .addOption('-pix_fmt', 'yuv420p')
    .format('flv')
    .output(output)

  return vOutput
}

function VideoStream(rtmpUrl) {
  // Input Stream
  const input = PassThrough()

  // FFMPEG Encoder Instance
  const encoder = Encoder(input, rtmpUrl)
    .on('data', data => console.info('On Data', data))
    .on('error', err => console.warn('On Error', err))
    .on('end', () => console.info('On End', data))
    .run()

  return {write: buffer => input.write(buffer)}
}

module.exports = VideoStream
