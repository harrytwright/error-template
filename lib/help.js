const error = require('./error')
const { commands, shorthands } = require('./config/command-list')

const cmds = commands.concat(Object.keys(shorthands))

module.exports.run = function (args, cb) {
  const argv = error.config.get('argv').cooked

  const section = error.deref(args[0]) || args[0]

  // error help <noargs>:  show basic usage
  if (!section) {
    const valid = argv[0] === 'help' ? 0 : 1
    return errorUsage(valid, cb)
  }

  // error <command> -h: show command usage
  if ((error.config.get('usage') || section) && error.commands[section] && error.commands[section].usage) {
    console.log(error.commands[section].usage.toString())
    return cb()
  }

  return cb(new Error('Could not find the valid error page'))
}

function errorUsage (valid, cb) {
  console.log([
    '\nUsage: error <command>',
    '',
    'where <command> is one of:',
    wrap(cmds),
    '',
    'error <command> -h  quick help on <command>',
    'error -l            display full usage info',
    'error help <term>   search for help on <term>',
    'error help npm      involved overview'
  ].join('\n'))

  cb(valid)
}

function wrap (arr) {
  const out = ['']
  let l = 0
  let line

  line = process.stdout.columns
  if (!line) {
    line = 60
  } else {
    line = Math.min(60, Math.max(line - 16, 24))
  }

  arr.sort(function (a, b) { return a < b ? -1 : 1 })
    .forEach(function (c) {
      if (out[l].length + c.length + 2 < line) {
        out[l] += ', ' + c
      } else {
        out[l++] += ','
        out[l] = c
      }
    })
  return out.join('\n    ').substr(2)
}
