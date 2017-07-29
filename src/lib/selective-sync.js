var debug = require('debug')('dat')
var path = require('path')
var EventEmitter = require('events').EventEmitter

module.exports = function selectiveSync (state, bus) {
  var archive = state.dat.archive
  debug('sparse mode. downloading metadata')
  var emitter = new EventEmitter()

  function download (entry) {
    debug('selected', entry)
    archive.stat(entry, function (err, stat) {
      if (err) return bus.emit('exit:error', err)
      if (stat.isDirectory()) downloadDir(entry, stat)
      if (stat.isFile()) downloadFile(entry, stat)
    })
  }

  function downloadDir (dirname, stat) {
    debug('downloading dir', dirname)
    archive.readdir(dirname, function (err, entries) {
      if (err) return bus.emit('exit:error', err)
      entries.forEach(function (entry) {
        emitter.emit('download', path.join(dirname, entry))
      })
    })
  }

  function downloadFile (entry, stat) {
    var start = stat.offset
    var end = stat.offset + stat.blocks
    state.selectedByteLength += stat.size
    bus.emit('render')
    if (start === 0 && end === 0) return
    debug('downloading', entry, start, end)
    archive.content.download({start, end}, function () {
      debug('success', entry)
    })
  }

  emitter.on('download', download)
  if (state.opts.select) state.opts.select.forEach(download)

  archive.metadata.update(function () {
    return bus.emit('exit:warn', `Dat successfully created in empty mode. Download files using pull or sync.`)
  })

  archive.on('update', function () {
    debug('archive update')
    bus.emit('render')
  })
}
