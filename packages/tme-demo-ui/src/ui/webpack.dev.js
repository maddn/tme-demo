const HTMLWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

module.exports = {
  entry: [
    'whatwg-fetch',
    `${__dirname}/src/index.js`,
    'webpack-hot-middleware/client'
  ],
  output: {
    filename: '[name].js',
    path: `${__dirname}/../../webui`,
    assetModuleFilename: '[name][ext]',
    publicPath: '/custom/tme-demo-ui'
  },
  mode: 'development',
  plugins: [
    new HTMLWebpackPlugin({
      template: `${__dirname}/webui/index.html`,
      filename: 'index.html',
      inject: 'body'
    }),
    new webpack.HotModuleReplacementPlugin(),
    new ReactRefreshWebpackPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: [
              'react-refresh/babel'
            ]
          }
        },
      }, {
        test: /\.(js|jsx)$/,
        use: [ 'source-map-loader' ],
        enforce: 'pre'
      }, {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      }, {
        test: /\.(svg|ttf|eot|png)$/,
        type: 'asset/resource'
      }
    ]
  },
  resolve: {
    symlinks: false,
    modules: [ path.resolve(__dirname, 'webui'), 'node_modules' ],
    extensions: [ '', '.js', '.jsx' ]
  }
};
