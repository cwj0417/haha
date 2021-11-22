const electron = require('electron')
const { rendererDevServer } = require('./renderer')
const { spawn, execSync } = require('child_process')
const { join } = require('path')
const { mainDevServer } = require('./main')
const { remove } = require('fs-extra')

let electronProcess = null

const execRoot = process.env.PWD

const projRoot = execRoot

const log = (content) => {
    console.log(content.toString())
}

const reloadElectron = () => {
    if (electronProcess) {
        electronProcess.kill()
        console.log('electron restart...')
    } else {
        console.log('start electron...')
    }
    electronProcess = spawn(electron, [join(execRoot, '/dist/main/index.js')])

    electronProcess.stdout.on('data', log)
    electronProcess.stderr.on('data', log)
}

const runDev = async () => {

    await remove(join(projRoot, 'dist', 'renderer'))
    await remove(join(projRoot, 'dist', 'main'))

    const { port } = await rendererDevServer()

    await mainDevServer(port, reloadElectron)

    reloadElectron()
}

runDev()
