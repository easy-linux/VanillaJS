const webpack = require('webpack')

module.exports = {
    mode: 'development',
    entry: './src/main.js',
    output: {
        path: __dirname + '/public',
        filename: 'bandle.js'
    },
    devServer: {
        port: 5000,
        static: './public',
        hot: true
    }
}