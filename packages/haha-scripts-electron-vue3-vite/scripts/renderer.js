const { createServer, build } = require('vite')
const { join } = require('path')
const { readdirSync } = require('fs')
const detect = require('detect-port')

const execRoot = process.env.PWD

const entries = readdirSync(join(execRoot, '/src/renderer')).filter(f => f.endsWith('.html'))
    .map(f => join(execRoot, '/src/renderer', f))

const configFile = join(execRoot, 'vite.config.js')

const rendererDevServer = async () => {
    const port = await detect(3000)
    const server = await createServer({
        ...configFile,
        server: {
            port,
        }
    })
    await server.listen()
    return {
        port,
    }
}

const rendererBuild = async () => {
    await build({
        ...configFile,
        base: '',
        build: {
            rollupOptions: {
                input: entries,
            },
            outDir: join(execRoot, 'dist', 'renderer'),
        },
        mode: 'production',
    })
}

module.exports = {
    rendererDevServer,
    rendererBuild,
}
