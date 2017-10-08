const refreshTime = 2 // Refresh time in seconds
const defaultCount = 0 // Default count to start with

// Query Strings
const qs = new URLSearchParams(window.location.search)

const accessToken = qs.get('accessToken')
const postId = qs.get('postId')
const debug = qs.get('debug') === 'true'

// Selectors
let like,
  love,
  sad,
  haha,
  angry,
  shock,
  error = {}

const parseReacts = e =>
  `reactions.type(${e}).limit(0).summary(total_count).as(reactions_${e.toLowerCase()})`

const reactions = ['LIKE', 'LOVE', 'WOW', 'HAHA', 'SAD', 'ANGRY']
  .map(parseReacts)
  .join(',')

function refreshCounts() {
  if (debug) {
    like.innerHTML = Number(like.innerHTML) + Math.floor(Math.random() * 10)
    love.innerHTML = Number(love.innerHTML) + Math.floor(Math.random() * 10)
    sad.innerHTML = Number(sad.innerHTML) + Math.floor(Math.random() * 10)
    haha.innerHTML = Number(haha.innerHTML) + Math.floor(Math.random() * 10)
    angry.innerHTML = Number(angry.innerHTML) + Math.floor(Math.random() * 10)
    shock.innerHTML = Number(shock.innerHTML) + Math.floor(Math.random() * 10)
  } else {
    const url = `https://graph.facebook.com/v2.8/${postId}?fields=${reactions}&access_token=${accessToken}`

    apiCall(url, res => {
      if (res.error) {
        error.innerHTML = res.error.message
        error.style.display = 'block'
      } else {
        like.innerHTML = defaultCount + res.reactions_like.summary.total_count
        love.innerHTML = defaultCount + res.reactions_love.summary.total_count
        sad.innerHTML = defaultCount + res.reactions_sad.summary.total_count
        haha.innerHTML = defaultCount + res.reactions_haha.summary.total_count
        angry.innerHTML = defaultCount + res.reactions_angry.summary.total_count
        shock.innerHTML = defaultCount + res.reactions_wow.summary.total_count
      }
    })
  }
}

function apiCall(url, callback) {
  const req = new XMLHttpRequest()

  req.onreadystatechange = function() {
    if (req.readyState == XMLHttpRequest.DONE) {
      const res = JSON.parse(req.responseText)

      if (res.status == 200) {
        callback(res)
      } else if (res.status == 400) {
        console.log('There was an error 400', res)
        callback(res)
      } else {
        console.log('something else other than 200 was returned', res)
        callback(res)
      }
    }
  }

  req.open('GET', url, true)
  req.send()
}

window.onload = function() {
  // Selectors

  like = document.querySelector('.like .counter')
  love = document.querySelector('.love .counter')
  sad = document.querySelector('.sad .counter')
  haha = document.querySelector('.haha .counter')
  angry = document.querySelector('.angry .counter')
  shock = document.querySelector('.shock .counter')
  error = document.getElementById('error')

  if (debug || (accessToken && postId)) {
    setInterval(refreshCounts, refreshTime * 1000)
    refreshCounts()
  } else {
    error.innerHTML = 'AccessToken or PostId not set!'
    error.style.display = 'block'
  }
}
