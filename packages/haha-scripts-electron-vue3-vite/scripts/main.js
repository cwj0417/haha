const { join } = require('path')
const { build, transformSync } = require('esbuild')
const { writeFileSync, readFileSync, ensureDirSync } = require('fs-extra')

const execRoot = process.env.PWD

let devPlugin = port => ({
    name: 'dev',
    setup(build) {
        build.onResolve({ filter: /^@\/renderer\/.*$/ }, args => ({
            path: args.path,
            namespace: 'dev-html',
        }))
        build.onLoad({ filter: /.*/, namespace: 'dev-html' }, args => {
            const path = args.path.slice(10)
            return {
                contents: `http://localhost:${port}${path}`,
                loader: 'text',
            }
        })
    },
})

let prodPlugin = () => ({
    name: 'prod',
    setup(build) {
        build.onResolve({ filter: /^@\/renderer\/.*$/ }, args => ({
            path: args.path,
            namespace: 'dev-html',
        }))
        build.onResolve({ filter: /^url$|^path$/ }, args => {
            return {
                external: true
            }
        })
        build.onLoad({ filter: /.*/, namespace: 'dev-html' }, (args) => {
            const path = args.path.slice(10).split('#')
            return {
                contents: `module.exports = require('url').pathToFileURL(require('path').join(__dirname, '../renderer', '${path[0]}')).toString() + '#${path[1]}';`,
                loader: 'js',
            }
        })
    },
})

let devPreloadPlugin = () => ({
    name: 'preload',
    setup(build) {
        build.onResolve({ filter: /^@\/preload\/.*$/ }, args => ({
            path: args.path,
            namespace: 'preload',
        }))
        build.onLoad({ filter: /.*/, namespace: 'preload' }, args => {
            const path = join(execRoot, '/src/main/preload', args.path.slice(9))
            const file = readFileSync(path).toString()
            const contents = transformSync(file, {
                loader: 'ts'
            }).code
            return {
                contents,
                loader: 'file',
            }
        })
    }
})

let prodPreloadPlugin = () => ({
    name: 'preload',
    setup(build) {
        build.onResolve({ filter: /^@\/preload\/.*$/ }, args => ({
            path: args.path,
            namespace: 'preload',
        }))
        build.onLoad({ filter: /.*/, namespace: 'preload' }, args => {
            const path = join(execRoot, '/src/main/preload', args.path.slice(9))
            const file = readFileSync(path).toString()
            const contents = transformSync(file, {
                loader: 'ts'
            }).code
            ensureDirSync(join(execRoot, '/dist/main')) // ???????????????????????????. ????????????????????????, ???esbuild?????????
            writeFileSync(join(execRoot, '/dist/main', args.path.slice(9)), contents)
            return {
                contents: `import { join } from 'path'; export default join(__dirname, '${args.path.slice(9)}')`,
                loader: 'js',
            }
        })
    }
})

const mainDevServer = async (port, onChange = () => { }) => {
    await build({
        entryPoints: [join(execRoot, 'src/main/index.ts')],
        outfile: 'dist/main/index.js',
        bundle: true, // ??????false???????????????????????????import
        platform: 'node',
        plugins: [devPlugin(port), devPreloadPlugin()], // ????????????
        external: ['electron'], // ???????????????????????????require('electron') ??????????????????resolve, ???????????????????????????
        watch: {
            onRebuild(error, result) {
                if (error) console.error('watch build failed:', error)
                else onChange()
            },
        },
        publicPath: join(execRoot, '/dist/main'),
    })
}

const mainProdBuild = async () => {
    await build({
        entryPoints: [join(execRoot, 'src/main/index.ts')],
        outfile: 'dist/main/index.js',
        bundle: true, // ??????false???????????????????????????import
        platform: 'node',
        plugins: [prodPlugin(), prodPreloadPlugin()], // ????????????
        external: ['electron'], // ???????????????????????????require('electron') ??????????????????resolve, ???????????????????????????
        publicPath: join(execRoot, '/dist/main'),
    })
}

module.exports = {
    mainDevServer,
    mainProdBuild,
}
