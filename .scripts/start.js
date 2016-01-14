#!/usr/bin/env node
var path = require('path'),
   fs = require('fs'),
   extend = require('util')._extend,
   exec = require('child_process').exec,
   processes = [];

var baseDir = path.resolve(__dirname, '..'),
   chimpBin = path.resolve(baseDir, 'node_modules/.bin/chimp');

var appOptions = {
  port: 3000,
  env: {
    ROOT_URL: 'http://localhost:3000/'
  },
  waitForMessage: 'App running at'
};

var chimpSwitches =
    '--ddp=' + appOptions.env.ROOT_URL +
    ' --path=' + path.resolve('tests/chimp') +
    ' --mocha';

if (!(process.env.CI || process.env.TRAVIS || process.env.CIRCLECI)) {
  chimpSwitches += ' --watch';
}

startApp(function () {
  startChimp(chimpSwitches);
});

function startApp(callback) {
  startProcess({
    name: 'Meteor App',
    command: 'meteor --port ' + appOptions.port,
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
