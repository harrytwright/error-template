const path = require('path')
const fs = require('fs')

const mkdirp = require('mkdirp')

const MODE_0666 = parseInt('0666', 8)
const MODE_0755 = parseInt('0755', 8)

/**
 * Make the given dir relative to base.
 *
 * @param {string} base
 * @param {string} dir
 */
module.exports.mkdir = function mkdir (base, dir) {
  const loc = path.join(base, dir)

  console.log(`   \x1b[36mcreate\x1b[0m : ${loc}${path.sep}`)
  mkdirp.sync(loc, MODE_0755)
}

/**
 * echo str > file.
 *
 * @param {String} file
 * @param {String} str
 * @param mode
 */

module.exports.write = function write (file, str, mode) {
  fs.writeFileSync(file, str, { mode: mode || MODE_0666 })
  console.log(`   \x1b[36mcreate\x1b[0m : ${file}`)
}

/**
 * Check if the given directory `dir` is empty.
 *
 * @param {String} dir
 * @param {Function} fn
 */

module.exports.emptyDirectory = function emptyDirectory (dir, fn) {
  fs.readdir(dir, function (err, files) {
    if (err && err.code !== 'ENOENT') throw err
    fn(!files || !files.length)
  })
}
