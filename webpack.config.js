const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const devMode = process.env.NODE_ENV !== 'production'

module.exports = {
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'main.css.[hash]',
      chunkFilename: '[id].[hash]',
    })
  ],
  context: path.join(__dirname, 'src'),
  entry: {
    'main.js': './main.js',
    'styles.css': './assets/styles.js'
  },
  output: {
    filename: '[name].[hash]',
    chunkFilename: '[id].[hash]',
    path: path.resolve(__dirname, 'public'),
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
        test: /\.(sa|sc|c)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
        ],
      }
    ],
  },
};
