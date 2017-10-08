const {Writable} = require('stream')
const {spawn} = require('child_process')
const {fps, logFile} = require('../config')

const ffmpegFlags = [
  '-threads',
  '0',
  '-y',
  '-v',
  'verbose',
  '-c:v',
  'png',
  '-r',
  fps,
  '-f',
  'image2pipe',
  '-i',
  '-',
  '-f',
  'lavfi',
  '-i',
  'anullsrc',
  '-acodec',
  'aac',
  '-ac',
  '1',
  '-ar',
  '44100',
  '-b:a',
  '128k',
  '-c:v',
  'libx264',
  '-s',
  '1280x720',
  '-pix_fmt',
  'yuv420p',
  '-f',
  'flv'
]

const log = `>> ${logFile} 2>&1`

class VideoStream extends Writable {
  constructor(rtmpUrl) {
    super()
    const args = [...ffmpegFlags, rtmpUrl]
    const stdio = ['pipe', 1, 2, 'ipc']

    this.ffmpeg = spawn('ffmpeg', args, {stdio}).stdin
  }

  write(buffer, encoding, callback) {
    this.ffmpeg.write(buffer)
  }
}

module.exports = VideoStream
