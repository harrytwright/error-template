#!/usr/bin/env node
(function () { // wrapper in case we're in module_context mode
  process.title = 'error'

  const config = require('@harrytwright/cli-config')

  const options = require('../lib/config/options')
  const errorCli = require('../lib/error')

  /**
   * Parse the argv and set the command of the program
   * */
  const cli = config.parse(options.types, options.shorthands)
  errorCli.argv = cli.argv.remain

  if (errorCli.deref(errorCli.argv[0])) {
    errorCli.command = errorCli.argv.shift()
  } else {
    cli.usage = true
  }

  if (cli.version || errorCli.command === 'version') {
    console.log(errorCli.version)
    return process.exit(0)
  }

  if (cli.usage && errorCli.command !== 'help') {
    errorCli.argv.unshift(errorCli.command)
    errorCli.command = 'help'
  }

  config.load(options.types, cli, options.defaults, (conf) => {
    errorCli.config = conf

    errorCli.commands[errorCli.command].run(errorCli.argv, function (err) {
      if (err) { console.error(err); process.exit(1) }
    })
  })
})()
