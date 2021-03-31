import { DefinePlugin } from 'webpack';
import dotenv from 'dotenv';

const autoprefixer = require('autoprefixer');
const path = require('path');

const StylelintPlugin = require('stylelint-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

import CONFIG from './config.json';

const config = {
  entry: './assets/js/main.ts',
  devtool: 'source-map',
  devServer: {
    contentBase: path.join(__dirname, 'out'),
    compress: true,
    host: CONFIG.private ? 'localhost' : '0.0.0.0',
    port: CONFIG.port,
    historyApiFallback: true,
    hot: true,
    overlay: true
  },
  plugins: [
    new DefinePlugin({
      'process.env': {
        npm_package_version: JSON.stringify(require('./package.json').version),
        api_url: JSON.stringify(dotenv.config().parsed.API_URL)
      }
    }),
    new StylelintPlugin({
      fix: true
    }),
    new MiniCssExtractPlugin({
      filename: './assets/css/[name].bundle.css',
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'assets/images/',
          to: 'assets/images/'
        },
        {
          from: 'assets/video/',
          to: 'assets/video/'
        }
      ]
    }),
  ],
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: [
          'babel-loader',
          {
            loader: 'eslint-loader',
            options: {
              fix: true
            }
          }
        ]
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              encoding: false,
              generator: content => content.toString()
            }
          }
        ]
      },
      {
        test: /\.(jpg|png|gif|svg|mp4|mp3|ttf|eot|otf|woff|woff2)$/,
        loader: 'url-loader',
        options: {
          limit: 8192,
          name: '[path][name].[ext]'
        }
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  output: {
    filename: './assets/js/[name].bundle.js',
    path: path.resolve(__dirname, 'out'),
    publicPath: '/'
  }
};

export default (env, argv) => {
  config.module.rules.push({
    test: /\.tsx?$/,
    exclude: /(node_modules|bower_components)/,
    use: [
      'babel-loader',
      {
        loader: 'ts-loader',
        options: {
          transpileOnly: !CONFIG.validateDev && argv.mode === 'development'
        }
      },
      {
        loader: 'eslint-loader',
        options: {
          fix: true
        }
      }
    ]
  });
  config.module.rules.push({
    test: /\.s[c|a]ss$/,
    exclude: /node_modules/,
    use: [
      argv.mode === 'production' ? MiniCssExtractPlugin.loader : 'style-loader',
      {
        loader: 'css-loader',
        options: {
          modules: {
            localIdentName: '[local]--[hash:base64:5]'
          }
        }
      },
      {
        loader: 'postcss-loader',
        options: {
          postcssOptions: {
            plugins: [autoprefixer()]
          }
        }
      },
      'sass-loader'
    ]
  });
  return config;
};
