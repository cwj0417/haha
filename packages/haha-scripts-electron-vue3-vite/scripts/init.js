const spawn = require('cross-spawn');
const packageJson = require('../package.json')

module.exports = function (
    appPath,
    appName,
    originalDirectory) {
    console.log('hi, there was haha-scripts')
    console.log('template was ', packageJson.templateOptions[0]) // 这里要改成命令行选择
    // todo: npm 下载 template . copy. package.json等细节 删除. 

    // todo: 写bin入口, 写start, build的脚本
    // todo: 写template, 并引入这个包, 看看是不是能执行

    spawn('yarnpkg', ['add', packageJson.templateOptions[0], '--cwd', appPath], { stdio: 'inherit' }).on('close', code => {
        if (code === 0) {
            console.log('haha-scripts was installed successfully!')
        } else {
            console.log('haha-scripts was failed to install!')
        }
    })
}
