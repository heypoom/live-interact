const req = require('request-promise')

async function startLiveVideo(data) {
  const {id} = await req({
    uri: `https://graph.facebook.com/v2.8/me/live_videos?access_token=${data.accessToken}`,
    method: 'POST',
    json: data
  })

  return getLiveVideo(id, data.accessToken)
}

const getLiveVideo = (postId, accessToken) =>
  req({
    uri: `https://graph.facebook.com/v2.8/${postId}?access_token=${accessToken}`,
    method: 'GET',
    json: true
  })

const deleteLiveVideo = (postId, accessToken) =>
  req({
    uri: `https://graph.facebook.com/v2.8/${postId}?access_token=${accessToken}`,
    method: 'DELETE',
    json: true
  })

const endLiveVideo = (postId, accessToken) =>
  req({
    uri: `https://graph.facebook.com/v2.8/${postId}?end_live_video=true&access_token=${accessToken}`,
    method: 'POST',
    json: true
  })

const getAllLiveVideos = accessToken =>
  req({
    uri: `https://graph.facebook.com/v2.8/me/live_videos?access_token=${accessToken}`,
    method: 'GET',
    json: true
  })

exports.startLiveVideo = startLiveVideo
exports.getLiveVideo = getLiveVideo
exports.deleteLiveVideo = deleteLiveVideo
exports.endLiveVideo = endLiveVideo
exports.getAllLiveVideos = getAllLiveVideos
