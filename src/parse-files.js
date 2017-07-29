var fs = require('fs')

module.exports = function (input) {
  var parsed = input.split(',')

  try {
    if (fs.statSync(input).isFile()) {
      parsed = fs.readFileSync(input).toString().trim().split('\n')
    }
  } catch (err) {
    if (err && !err.name === 'ENOENT') {
      console.error(err)
      process.exit(1)
    }
  }

  return parsed
}
