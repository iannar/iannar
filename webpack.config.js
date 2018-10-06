'use strict';

const path = require('path');
const _ = require('lodash');
const metadata = require('./metadata.json');
const CleanPlugin = require('clean-webpack-plugin');
const HtmlPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const ExtractCssChunksPlugin = require('extract-css-chunks-webpack-plugin');

module.exports = (env, argv) => {
  const prodMode = argv.mode === 'production';
  const config = {
    mode: argv.mode || 'development',
    entry: './src/index.js',
    output: {
      path: path.join(__dirname, 'assets'),
      publicPath: '/assets/',
      filename: prodMode ? 'js/[name].[chunkhash].js' : 'js/[name].js',
      chunkFilename: prodMode ? 'js/[id].[chunkhash].js' : 'js/[id].js',
    },
    resolve: {
      extensions: ['.js', '.jsx', '.json'],
    },
    module: {
      rules: [{
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
        },
      }, {
        test: /\.css$/,
        use: [{
          loader: ExtractCssChunksPlugin.loader,
        }, {
          loader: 'css-loader',
        }],
      }],
    },
    optimization: {
      minimizer: [
        new UglifyJsPlugin({
          extractComments: true,
          uglifyOptions: {
            compress: {
              warnings: false,
            },
          },
          parallel: true,
        }),
      ],
    },
    plugins: [
      new ExtractCssChunksPlugin({
        filename: prodMode ? 'css/[name].[contenthash].css' : 'css/[name].css',
        chunkFilename: prodMode ? 'css/[id].[contenthash].css' : 'css/[id].css',
      }),
      new HtmlPlugin({
        filename: '../index.html',
        template: 'src/index.html',
        minify: {
          removeComments: true,
          collapseWhitespace: true,
          removeAttributeQuotes: true,
        },
        chunksSortMode: 'dependency',
        title: _.get(metadata, 'brand'),
        meta: {
          'viewport': [
            'width=device-width',
            'initial-scale=1.0',
            'minimum-scale=1.0',
            'maximum-scale=1.0',
            'user-scalable=no',
          ].join(','),
          'google-analytics': _.get(metadata, 'google.ga'),
        },
      }),
    ],
    externals: {
      'react': 'React',
      'react-dom': 'ReactDOM',
    },
    devServer: {
      historyApiFallback: true,
      open: true,
    },
  };
  if (prodMode) {
    config.plugins.unshift(new CleanPlugin([
      'assets/css',
      'assets/js',
    ]));
  } else {
    config.devtool = 'eval';
  }
  return config;
};
