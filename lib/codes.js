const _ = require('statuses')

const error = require('./error')
const Usage = require('./utils/usage')
const between = require('./utils/between')

const codes = module.exports = {}

codes.usage = new Usage('codes', 'Log error codes we are using', [
  'error codes',
  'error codes <code>'
], '[--between]')

codes.run = function (argv, cb) {
  const range = error.config.get('between')
  const arg = argv.pop()

  /**
   *  Work around for --between not being a list like
   *  option...
   */
  if (arg && arraysEqual(range, [100, 511])) {
    output(parseInt(arg, 10))
    return cb()
  } else if (arg && range.length !== 2) {
    range.push(parseInt(arg, 10))
  } else if (range.length !== 2) {
    return cb(new Error('Invalid range, should be called `error codes --between min max`'))
  }

  const _range = { min: range[0], max: range[1] }
  const statuses = _.codes.filter((el) => filter(el, _range))

  statuses.forEach(output)
  cb()
}

function filter (key, range) {
  return between(Number(key), range.min, range.max)
}

function output (code) {
  console.log(`  \x1b[31m${code}\x1b[0m ${_.message[code]}`)
}

function arraysEqual (a, b) {
  if (a === b) return true
  if (a == null || b == null) return false
  if (a.length !== b.length) return false

  // If you don't care about the order of the elements inside
  // the array, you should sort both arrays here.
  // Please note that calling sort on an array will modify that array.
  // you might want to clone your array first.

  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false
  }
  return true
}
