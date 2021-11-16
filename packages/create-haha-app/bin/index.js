#!/usr/bin/env node
const commander = require('commander');
const packageJson = require('../package.json');
const spawn = require('cross-spawn');

let projname = '';

const program = new commander.Command(packageJson.name)
    .arguments('<project-directory>')
    .option('-t, --template <template>', 'template to use', 'haha-tpl-electron-vue3-vite')
    .option('-s, --scripts <script>', 'script to use', 'haha-scripts')
    .action((name) => {
        projname = name;
    })
program.parse(process.argv);

const options = program.opts();

if (options.template && options.scripts) {
    const { template, scripts } = options;
    console.log(projname, template, scripts);
    spawn('yarnpkg', ['add', projname, template, scripts], { stdio: 'inherit' }).on('close', code => process.exit(code));
} else {
    console.error('missing template and scripts')
}