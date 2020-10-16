let defaults

Object.defineProperty(exports, 'defaults', {
  get: function () {
    if (defaults) { return defaults }

    defaults = {
      between: [100, 511],
      dir: '.',
      test: false,
      usage: false,
      version: false
    }

    return defaults
  }
})

exports.types = {
  between: [Number, Array],
  dir: require('path'),
  test: Boolean,
  usage: Boolean,
  version: Boolean
}

exports.shorthands = {
  D: ['--dir'],
  help: ['--usage'],
  v: ['--version']
}
