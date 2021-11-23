const spawn = require('cross-spawn');
const packageJson = require('../package.json')
const fs = require('fs-extra')
const path = require('path')

module.exports = function (
    appPath,
    appName,
    originalDirectory) {
    console.log('hi, there was haha-scripts')
    const tpl = packageJson.templateOptions[0] // 这里要改成命令行选择
    console.log('template was ', tpl)

    spawn('yarnpkg', ['add', tpl, '--cwd', appPath], { stdio: 'inherit' }).on('close', code => {
        if (code === 0) {
            console.log('haha-scripts was installed successfully!')
            fs.copySync(path.join(__dirname, 'node_modules', tpl, 'template'), appPath)
            process.chdir(appPath)
            spawn('yarn', ['install'], { stdio: 'inherit' })
        } else {
            console.log('haha-scripts was failed to install!')
        }
    })
}
