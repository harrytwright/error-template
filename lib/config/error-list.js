const _ = require('lodash')
const statuses = require('statuses')
const httpStatuses = require('http-status-codes')

const between = require('../utils/between')

let kErrors
module.exports = errors()

function errors () {
  if (kErrors) { return kErrors }

  kErrors = []
  for (const [code, title] of Object.entries(statuses.message)) {
    try {
      // Since `statuses` contains more status codes than http-status-codes
      // so we don't run into any issues later on will remove them. May look
      // More into which will be the dominate package before 1.0.0
      httpStatuses.getReasonPhrase(code)
      if (between(parseInt(code), 400, 500) || statuses.empty[code] || statuses.redirect[code] || statuses.retry[code]) {
        kErrors.push({
          klass: _.upperFirst(_.camelCase(title)),
          status: parseInt(code)
        })
      }
    } catch (e) { }
  }
  return kErrors
}
