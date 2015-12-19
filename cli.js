#!/usr/bin/env node
var args = require('minimist')(process.argv.splice(2))
var usage = require('./usage')
var fs = require('fs')
var dat = require('./')

var cmd = args._[0]

run()

function run () {
  var loc = args._[1] || process.cwd()
  var db
  if (cmd === 'share') {
    // share
    if (!fs.existsSync(loc)) return usage('root.txt')
    db = dat(loc)
    db.share(function (err, link) {
      if (err) throw err
      console.log(link)
    })
  } else if (cmd) {
    // download
    var hash = args._[0]
    if (!hash) return usage('root.txt')
    db = dat(loc)
    db.download(hash, function (err) {
      if (err) throw err
      console.log('done downloading')
    })
  } else {
    return usage('root.txt')
  }
}
