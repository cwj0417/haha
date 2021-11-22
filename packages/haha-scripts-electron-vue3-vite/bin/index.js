#!/usr/bin/env node
const spawn = require('cross-spawn');

const scripts = {
    dev: [process.execPath, [require.resolve('../scripts/dev.js')], { stdio: 'inherit' }],
    build: [process.execPath, [require.resolve('../scripts/build.js')], { stdio: 'inherit' }],
    "build:arm": [process.execPath, [require.resolve('../scripts/build.js'), 'arm'], { stdio: 'inherit' }],
}

const script = process.argv[2]

if (!script) {
    console.error('script not found', process.argv)
}

if (scripts[script]) {
    spawn(...scripts[script])
} else {
    console.error('script not supported: ', script)
}