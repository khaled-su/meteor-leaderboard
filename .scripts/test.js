#!/usr/bin/env node
var path = require('path'),
   extend = require('util')._extend,
   exec = require('child_process').exec;

var baseDir = path.resolve(__dirname, '..'),
    chimpScript = path.resolve(__dirname, 'start.js'),
    gagarinBin = path.resolve(baseDir, 'node_modules/.bin/gagarin');

runTests();

function runTests() {
  runGagarin(function () {
    runChimp(function () {
      console.log('Yay!');
    });
  });
}

function runGagarin(callback) {
  startProcess({
    name: 'Gagarin',
    options: {},
    command: gagarinBin + ' -v'
  }, callback);
}

function runChimp(callback) {
  startProcess({
    name: 'Chimp',
    options: {
      env: extend({CI: 1}, process.env)
    },
    command: chimpScript
  }, callback);
}

function startProcess(opts, callback) {
  var proc = exec(
     opts.command,
     opts.options
  );
  proc.stdout.pipe(process.stdout);
  proc.stderr.pipe(process.stderr);
  proc.on('close', function (code) {
    if (code > 0) {
      console.log(opts.name, 'exited with code ' + code);
      process.exit(code);
    } else {
      callback();
    }
  });
}
