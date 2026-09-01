const HTMLWebpackPlugin = require('html-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');

module.exports = {
  entry: [
    'whatwg-fetch',
    `${__dirname}/src/index.js`
  ],
  output: {
    filename: '[name].js',
    path: `${__dirname}/../../webui`,
    assetModuleFilename: '[name][ext]'
  },
  mode: 'production',
  performance: {
    hints: false
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      name: 'vendors'
    },
    minimizer: [
      '...',
      new CssMinimizerPlugin()
    ]
  },
  plugins: [
    new HTMLWebpackPlugin({
      template: `${__dirname}/webui/index.html`,
      filename: 'index.html',
      inject: 'body'
    }),
    new MiniCssExtractPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }, {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
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
    extensions: ['', '.js', '.jsx']
  }
};
