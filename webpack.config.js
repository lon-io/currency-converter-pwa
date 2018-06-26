const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const Visualizer = require('webpack-visualizer-plugin');
const devMode = process.env.NODE_ENV !== 'production'

module.exports = {
  // Include source maps in development files
  devtool: devMode ?  '#cheap-module-source-map' : false,

  context: path.join(__dirname, 'src'),

  plugins: [
    new MiniCssExtractPlugin({
      filename: 'main.[hash].css',
      chunkFilename: '[id].[hash]',
    }),
    new CopyWebpackPlugin([{
      from: './assets/fonts',
      to: 'fonts',
    }, ]),
    new HtmlWebpackPlugin({
      title: 'PWA Example',
      template: path.resolve(__dirname, 'src/views/index.ejs'),
    }),
    new Visualizer(),
  ],

  entry: {
    'main': './main.js',
  },

  resolve: {
    extensions: ['*', '.js'],
    modules: [
        path.resolve(__dirname, 'node_modules'),
    ],
    alias: {
        handlebars: 'handlebars/dist/handlebars.min.js',
    }
  },

  output: {
    filename: '[name].[hash].js',
    chunkFilename: '[id].[hash]',
    path: path.resolve(__dirname, 'dist'),
  },

  module: {
    rules: [
      {
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
            name: 'fonts/[name].[hash:7].[ext]'
        }
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        query: {
            limit: 10000,
            name: 'images/[name].[ext].[hash:7]'
        }
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
        test: /\.handlebars$/,
        loader: 'text-loader',
      },
    ],
  },
};
