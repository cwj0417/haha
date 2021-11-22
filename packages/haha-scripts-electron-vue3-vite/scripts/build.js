const builder = require("electron-builder")
const Platform = builder.Platform
const { join } = require('path')
const { remove, writeFile } = require('fs-extra')
const { rendererBuild } = require('./renderer')
const { mainProdBuild } = require('./main')

const execRoot = process.env.PWD

const projRoot = execRoot

const runBuild = async () => {

    const isArm = process.argv[2] === 'arm'

    // 清理dist和built
    await remove(join(projRoot, 'build', 'built'))
    await remove(join(projRoot, 'dist', 'renderer'))
    await remove(join(projRoot, 'dist', 'main'))

    // vite(rollup)打包renderer进程
    await rendererBuild()

    // esbuild打包main进程
    await mainProdBuild()

    // 写入package.json
    const packageJson = require(join(projRoot, 'package.json'))
    writeFile(join(projRoot, 'dist', 'package.json'), JSON.stringify(packageJson))

    const config = require(join(projRoot, 'build', 'config.js'))

    if (isArm) {
        config.mac.target = [{
            target: 'dir',
            arch: ['arm64']
        }]
    }

    // build electron
    builder.build({
        targets: Platform.MAC.createTarget(),
        config,
        publish: isArm ? 'never' : 'always',
    })
        .then(() => {
            console.log('done')
        })
        .catch((error) => {
            console.log('err', error);
        })
}

runBuild()
