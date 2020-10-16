const shorthands = {
  b: 'build'
}

const affordances = {
  bulid: 'build',
  code: 'codes',
  verison: 'version'
}

const commands = [
  'build',
  'codes',
  'help',
  'version'
]

module.exports.aliases = Object.assign({}, shorthands, affordances)
module.exports.shorthands = shorthands
module.exports.affordances = affordances
module.exports.commands = commands
