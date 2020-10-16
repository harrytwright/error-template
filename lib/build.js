const fs = require('fs')
const path = require('path')
const util = require('util')

const ejs = require('ejs')
const statuses = require('http-status-codes')

const error = require('./error')
const Usage = require('./utils/usage')
const errors = require('./config/error-list')
const { write, mkdir } = require('./utils/bash_methods')
const TEMPLATE_DIR = require('./utils/template-dir')

const build = module.exports = {}

build.usage = new Usage('build', 'Build the src files for error', [
  'error build'
], '[--dir=.]')

/* Should we look into checking to see if dir exists first or throw an error?? */
build.run = function (argv, cb) {
  const dir = error.config.get('dir')

  if (!fs.existsSync(dir)) { return cb(new Error('dir does not exist')) }

  const errorTemp = loadTemplate('js/index.js')
  const testTemp = loadTemplate('js/index.test.js')
  const typeTemp = loadTemplate('ts/index.d.ts')
  errorTemp.locals.errors = testTemp.locals.errors = typeTemp.locals.errors = errors

  // Export the import https://stackoverflow.com/a/18500846/7031674
  testTemp.locals._statuses = statuses

  mkdir(dir, 'src')
  mkdir(dir, 'types')
  if (error.config.get('test')) mkdir(dir, 'test')

  write(path.join(dir, 'src/index.js'), errorTemp.render())
  write(path.join(dir, 'types/index.d.ts'), typeTemp.render())
  if (error.config.get('test')) write(path.join(dir, 'test/error.test.js'), testTemp.render())

  cb()
}

/**
 * Load template file.
 */

function loadTemplate (name) {
  const contents = fs.readFileSync(path.join(TEMPLATE_DIR, (`${name}.ejs`)), 'utf-8')
  const locals = Object.create(null)

  function render () {
    return ejs.render(contents, locals, {
      escape: util.inspect
    })
  }

  return {
    locals: locals,
    render: render
  }
}
