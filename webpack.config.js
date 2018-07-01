const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const Visualizer = require('webpack-visualizer-plugin');
const devMode = process.env.NODE_ENV !== 'production';

module.exports = {
    // Include source maps in development files
    devtool: devMode ? '#cheap-module-source-map' : false,

    context: path.join(__dirname, 'src'),

    plugins: [
        new MiniCssExtractPlugin({
            filename: 'css/main.css',
            chunkFilename: '[id].[hash]',
        }),
        new CopyWebpackPlugin([{
            from: './assets/images',
            to: 'images',
        }, ]),
        new HtmlWebpackPlugin({
            title: 'Currency Converter Example',
            template: path.resolve(__dirname, 'src/views/index.ejs'),
            excludeChunks: [ 'sw.js', ],
        }),
        new Visualizer(),
    ],

    entry: {
        'js/main': [
            'babel-polyfill',
            '../node_modules/indexeddbshim/dist/indexeddbshim.min.js', // IDB PolyFill
            './main.js',
        ],
        sw: './sw.js',
    },

    resolve: {
        extensions: ['*', '.js', ],
        modules: [
            path.resolve(__dirname, 'node_modules'),
        ],
        alias: {
            handlebars: 'handlebars/dist/handlebars.min.js',
        },
    },

    output: {
        filename: '[name].js',
        chunkFilename: '[id].[hash]',
        path: path.resolve(__dirname, 'dist'),
        globalObject: 'this', // https://github.com/webpack/webpack/issues/6642#issuecomment-371087342
    },

    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            use: [
                'babel-loader',
            ],
        },
        {
            test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
            loader: 'url-loader',
            options: {
                limit: 1000,
                name: 'fonts/[name].[ext]',
                publicPath: '../', // 😄 https://github.com/webpack-contrib/file-loader/issues/32#issuecomment-250622904
            },
        },
        {
            test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
            loader: 'url-loader',
            query: {
                limit: 10000,
                name: 'images/[name].[ext]',
            },
        },
        {
            test: /\.(sa|sc|c)ss$/,
            use: [
                MiniCssExtractPlugin.loader,
                'css-loader',
                'sass-loader',
            ],
        },
        {
            test: /\.hbs$/,
            loader: 'text-loader',
        },
        ],
    },
};
