const fs = require('fs')
const {Writable, PassThrough} = require('stream')
const {spawn} = require('child_process')
const ffmpeg = require('fluent-ffmpeg')

const {fps, logFile, size: {width, height}} = require('../config')

const logStream = fs.createWriteStream(logFile)

// prettier-ignore
const ffmpegFlags = [
  '-threads', '0',
  '-y',
  '-v', 'verbose',

  '-c:v', 'png',
  '-r', fps,
  '-f', 'image2pipe',
  '-i', '-',
  '-f', 'lavfi',
  '-i', 'anullsrc',

  '-acodec', 'aac',
  '-ac', '1',
  '-ar', '44100',
  '-b:a', '128k',
  '-c:v', 'libx264',
  '-s', `${width}x${height}`,
  '-pix_fmt', 'yuv420p',
  '-f', 'flv'
]

// .input('-', this.input)
// .fps(fps)
// .inputFormat('image2pipe')
// .inputFormat('lavfi')
// .videoCodec('png')
// .input('anullsrc')
// .audioCodec('aac')
// .audioChannels(1)
// .audioFrequency(44100)
// .audioBitrate(128)
// .videoCodec('libx264')
// .size('1280x720')
// .outputOptions('-pix_fmt', 'yuv420p')
// .format('flv')

// this.input = new PassThrough()

// const command = ffmpeg(this.input)
//   .format('flv')
//   .size('1280x720')
//   .videoCodec('libx264')
//   .fps(fps)
//   .audioBitrate(128)
//   .audioCodec('aac')
//   .audioFrequency(44100)
//   .audioChannels(2)
//   .output(rtmpUrl)
//   .on('error', err => console.error('FFMPEG Error:', err))
//   .on('data', data => console.info('FFMPEG Data:', data))
//   .on('end', () => console.info('Finished Processing...'))
//
// console.info('ffmpeg', command._getArguments().join(' '))
//
// command.run()

class VideoStream extends Writable {
  constructor(rtmpUrl) {
    super()
    const args = [...ffmpegFlags, rtmpUrl]
    const stdio = ['pipe', 1, 2, 'ipc']
    this.ffmpeg = spawn('ffmpeg', args, {stdio})
  }

  write(buffer) {
    this.ffmpeg.stdin.write(buffer)
  }
}

module.exports = VideoStream
