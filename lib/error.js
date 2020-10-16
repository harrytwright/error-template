/**
 *
 * error.js
 *
 * This file just handles the mini work of converting the command
 * to the required command.js, setting the global config, and
 * setting the cli version
 *
 * This is a very stripped down version of `npm(1)` using
 * npm dependencies as these should never have an issue
 * not being installed or security advisories
 *
 * */

const fs = require('fs')
const path = require('path')
const { EventEmitter } = require('events')

const abbrev = require('abbrev')

const { commands, aliases } = require('./config/command-list')

const error = module.exports = new EventEmitter()

error.config = {
  loaded: false,
  get: function () {
    throw new Error('error.config not set')
  },
  set: function () {
    throw new Error('error.config not set')
  }
}

error.commands = { }

try {
  // startup, ok to do this synchronously
  const j = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json')) + '')
  error.name = j.name
  error.version = j.version
} catch (ex) {
  try {
    console.error('error reading version', ex)
  } catch (er) { /* Lint fixer mwahaha */ }
  error.version = ex
}

const commandCache = {}
const aliasNames = Object.keys(aliases)

let fullList = commands.concat(aliasNames)

const abbrevs = abbrev(fullList)
fullList = error.fullList = fullList

Object.keys(abbrevs).forEach(function addCommand (c) {
  Object.defineProperty(error.commands, c, {
    get: function () {
      const a = error.deref(c)

      error.command = c
      if (commandCache[a]) return commandCache[a]

      const cmd = require(path.join(__dirname, a + '.js'))

      commandCache[a] = function () {
        const args = Array.prototype.slice.call(arguments, 0)
        if (typeof args[args.length - 1] !== 'function') {
          args.push(defaultCb)
        }
        if (args.length === 1) args.unshift([])

        // Options are prefixed by a hyphen-minus (-, \u2d).
        // Other dash-type chars look similar but are invalid.
        Array(args[0]).forEach(function (arg) {
          if (/^[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D]/.test(arg)) {
            console.error('arg', 'Argument starts with non-ascii dash, this is probably invalid:', arg)
          }
        })

        cmd.apply(error, args)
      }

      Object.keys(cmd).forEach(function (k) {
        commandCache[a][k] = cmd[k]
      })

      return commandCache[a]
    },
    enumerable: fullList.indexOf(c) !== -1,
    configurable: true
  })

  // make css-case commands callable via camelCase as well
  if (c.match(/-([a-z])/)) {
    addCommand(c.replace(/-([a-z])/g, function (a, b) {
      return b.toUpperCase()
    }))
  }
})

function defaultCb (er, data) {
  if (er) console.error(er.stack || er.message)
  else console.log(data)
}

error.deref = function (c) {
  if (!c) return ''
  if (c.match(/[A-Z]/)) {
    c = c.replace(/([A-Z])/g, function (m) {
      return '-' + m.toLowerCase()
    })
  }

  let a = abbrevs[c]
  while (aliases[a]) {
    a = aliases[a]
  }

  return a
}
