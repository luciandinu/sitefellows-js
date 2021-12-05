//var webpack = require("webpack");
const path = require('path');

module.exports = {
    entry: './src/main.js',
    mode: 'production',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'sitefellows.js',
    },
};
