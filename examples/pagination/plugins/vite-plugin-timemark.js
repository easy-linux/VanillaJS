import fs from 'fs'
import { resolve } from 'path'
const fileregex = /\.(css|js)$/i
const vendorRegex = /vendor/

let viteConfig
const zeroPad = (num, places) => String(num).padStart(places, '0')

export default function tomeMarkPlugin() {
    return {
        name: 'timemark-plugin',
        configResolved(config) {
            viteConfig = config
        },
        writeBundle: async (options, bundle) => {

            const bundles = Object.entries(bundle)
            const root = viteConfig.root
            const outDir = viteConfig.build.outDir || 'dist'
            bundles.forEach(bundle => {
                const bundleFileName = bundle[0]
                const bundleFilePath = resolve(root, outDir, bundleFileName)
                if (fileregex.test(bundleFileName) && !vendorRegex.test(bundleFileName)) {
                    try {
                        const code = fs.readFileSync(bundleFilePath, {encoding: 'utf8'})
                        var currentDate = new Date()
                        const data = `/* Last build: ${zeroPad(currentDate.getDate())}:${zeroPad(currentDate.getMonth())}:${currentDate.getFullYear()}  ${zeroPad(currentDate.getHours())}.${zeroPad(currentDate.getMinutes())}.${zeroPad(currentDate.getSeconds())}*/\n${code}`
                        fs.writeFileSync(bundleFilePath, data)
                    } catch (e) {
                        console.log(e)
                    }
                }
            })
        }
    }
}