const fs = require('fs')
const {Writable} = require('stream')
const {spawn} = require('child_process')

const {fps, logFile, size: {width, height}} = require('../config')

// prettier-ignore
const ffmpegFlags = [
  '-threads', '0',            // Threads: 0
  '-y',                       // Replace Existing File
  '-v',       'verbose',      // Logging Level: Verbose

  // Inputs
  '-c:v',     'png',          // Video Codec: PNG
  '-r',       fps,            // Frames Per Second
  '-f',       'image2pipe',   // Video Format: Image to Pipe
  '-i',       '-',            // Input: Piped from stdin
  '-f',       'lavfi',        // Video Format: LAVFI

  // Audio Settings
  '-i',       'anullsrc',     // Source: Null Audio Source
  '-acodec',  'aac',          // Codec: AAC
  '-ac',      '1',            // Channels: 1
  '-ar',      '44100',        // Frequency: 44100
  '-b:a',     '128k',         // Bitrate: 128k

  // Video Output
  '-c:v',     'libx264',              // Video Codec: libx264
  '-s',       `${width}x${height}`,   // Size: width x height
  '-pix_fmt', 'yuv420p',              // Pix Format: YUV420P
  '-f',       'flv'                   // Video Format: FLV
]

const logStream = fs.createWriteStream(logFile)

class VideoStream extends Writable {
  constructor(rtmpUrl) {
    super()
    const args = [...ffmpegFlags, rtmpUrl]
    const stdio = ['pipe', 1, 2, 'ipc']
    this.ffmpeg = spawn('ffmpeg', args, {stdio})
  }

  write(buffer, encoding, callback) {
    this.ffmpeg.stdin.write(buffer)
  }
}

module.exports = VideoStream
