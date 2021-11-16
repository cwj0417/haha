#!/usr/bin/env node
const commander = require('commander');
const packageJson = require('../package.json');
const spawn = require('cross-spawn');
const path = require('path');
const fs = require('fs-extra');
const os = require('os');

let projname = '';

const program = new commander.Command(packageJson.name)
    .arguments('<project-directory>')
    .option('-t, --template <template>', 'template to use', 'hh-tpl-electron-vue3-vite')
    .option('-s, --scripts <script>', 'script to use', 'haha-scripts')
    .action((name) => {
        projname = name;
    })
program.parse(process.argv);

const options = program.opts();

if (options.template && options.scripts) {
    const { template, scripts } = options;

    const root = path.resolve(projname);

    fs.ensureDirSync(root);

    const packageJson = {
        name: projname,
        version: '0.1.0',
        private: true,
      };
      fs.writeFileSync(
        path.join(root, 'package.json'),
        JSON.stringify(packageJson, null, 2) + os.EOL
      );

    process.chdir(root);

    console.log(projname, template, scripts);
    spawn('yarnpkg', ['add', template, scripts, '--cwd', root], { stdio: 'inherit' }).on('close', code => {
        if (code === 0) {
            const script = `
            const init = require('${scripts}/scripts/init.js');
            init.apply(null, JSON.parse(process.argv[1]));
            `;
            console.log(script);
            spawn(process.execPath, ['-e', script, '--', JSON.stringify(template)], { stdio: 'inherit' });
        } else {
            process.exit(code);
        }
    });
} else {
    console.error('missing template and scripts')
}