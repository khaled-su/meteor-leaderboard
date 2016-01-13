#!/usr/bin/env node
var path = require('path'),
   fs = require('fs'),
   extend = require('util')._extend,
   exec = require('child_process').exec,
   processes = [];

var baseDir = path.resolve(__dirname, '..'),
   chimpBin = path.resolve(baseDir, 'node_modules/.bin/chimp');

var appOptions = {
  settings: 'settings.json',
  port: 3000,
  env: {
    ROOT_URL: 'http://localhost:3000/'
  }
};

var chimpSwitches =
    ' --path=' + path.resolve('tests/chimp') +
    ' --mocha';

if (process.env.CI || process.env.TRAVIS || process.env.CIRCLECI) {
  // when not in Watch mode, Chimp existing will exit Meteor too
  // we also don't need Velocity for the app chimp will run against
  appOptions.env.VELOCITY = 0;
} else {
  chimpSwitches += ' --watch';
}

startChimp('--ddp=' + appOptions.env.ROOT_URL + chimpSwitches);

function startApp(callback) {
  startProcess({
    name: 'Meteor App',
    command: 'meteor --settings ' + appOptions.settings + ' --port ' + appOptions.port,
    waitForMessage: appOptions.waitForMessage,
    options: {
      env: extend(appOptions.env, process.env)
    }
  }, callback);
}

function startChimp(command) {
  startProcess({
    name: 'Chimp',
    command: chimpBin + ' ' + command
  });
}

function startProcess(opts, callback) {
  var proc = exec(
     opts.command,
     opts.options
  );
  if (opts.waitForMessage) {
    proc.stdout.on('data', function waitForMessage(data) {
      if (data.toString().match(opts.waitForMessage)) {
        if (callback) {
          callback();
        }
      }
    });
  }
  if (!opts.silent) {
    proc.stdout.pipe(process.stdout);
    proc.stderr.pipe(process.stderr);
  }
  if (opts.logFile) {
    var logStream = fs.createWriteStream(opts.logFile, {flags: 'a'});
    proc.stdout.pipe(logStream);
    proc.stderr.pipe(logStream);
  }
  proc.on('close', function (code) {
    console.log(opts.name, 'exited with code ' + code);
    for (var i = 0; i < processes.length; i += 1) {
      processes[i].kill();
    }
    process.exit(code);
  });
  processes.push(proc);
}
