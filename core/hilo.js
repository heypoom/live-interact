const Provable = require('provable')

function Round(round) {
  const engine = Provable({count: 10000})
  let hashes = []
  let rolls = []

  return {
    seed: engine.state().seed,
    hashes,
    rolls,
    roll() {
      try {
        const hash = engine.next()
        const roll = Math.round(Provable.toFloat(hash, 1, 6, true))
        hashes.push(hash)
        rolls.push(roll)

        return roll
      } catch (e) {
        engine = Provable({count: 10000})
        return roll()
      }
    }
  }
}

function Hilo() {
  const round = Round(5)
  const dices = [...Array(3)].map(round.roll)
  const sum = dices.reduce((a, b) => a + b, 0)

  const low = sum >= 4 && sum <= 10
  const high = sum >= 11 && sum <= 17
  const even = sum % 2 === 0
  const odd = sum % 2 !== 0

  return {dices, sum, low, high, even, odd, ...round}
}

const game = Hilo()
console.log(game)
