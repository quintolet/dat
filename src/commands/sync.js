module.exports = {
  name: 'sync',
  command: sync,
  help: [
    'Sync a Dat archive with the network',
    'Watch and import file changes (if archive is writable)',
    '',
    'Usage: dat sync'
  ].join('\n'),
  options: [
    {
      name: 'import',
      boolean: true,
      default: true,
      help: 'Import files from the directory to the database (Dat Writable).'
    },
    {
      name: 'ignoreHidden',
      boolean: true,
      default: true,
      abbr: 'ignore-hidden'
    },
    {
      name: 'watch',
      boolean: true,
      default: true,
      help: 'Watch for changes and import updated files (Dat Writable).'
    },
    {
      name: 'show-key',
      boolean: true,
      default: false,
      abbr: 'k',
      help: 'Print out the dat key (Dat Not Writable).'
    }
  ]
}

function sync (opts) {
  var Dat = require('dat-node')
  var neatLog = require('neat-log')
  var archiveUI = require('../ui/archive')
  var trackArchive = require('../lib/archive')
  var onExit = require('../lib/exit')
  var parseArgs = require('../parse-args')
  var debug = require('debug')('dat')

  debug('dat sync')
  var parsed = parseArgs(opts)
  opts.key = parsed.key
  opts.dir = parsed.dir || process.cwd()
  opts.showKey = opts['show-key'] // using abbr in option makes printed help confusing

  // Force options
  opts.createIfMissing = false // sync must always be a resumed archive
  opts.exit = false

  var neat = neatLog(archiveUI, { logspeed: opts.logspeed, quiet: opts.quiet })
  neat.use(trackArchive)
  neat.use(onExit)
  neat.use(function (state, bus) {
    state.opts = opts

    Dat(opts.dir, opts, function (err, dat) {
      if (err && err.name === 'MissingError') return bus.emit('exit:warn', 'No existing archive in this directory.')
      if (err) return bus.emit('exit:error', err)

      state.dat = dat
      bus.emit('dat')
      bus.emit('render')
    })
  })
}
