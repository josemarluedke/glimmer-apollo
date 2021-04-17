const path = require('path');
const glob = require('glob');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = () => {
  const IS_PRODUCTION = process.env.NODE_ENV === 'production';

  const entry = {
    app: './src/index.ts'
  };

  const plugins = [
    new HtmlWebpackPlugin({
      template: './index.html',
      excludeChunks: ['tests']
    }),
    new CopyPlugin({ patterns: [{ from: 'public', to: 'public' }] }),
    new MiniCssExtractPlugin()
  ];

  // Include tests in development builds
  if (!IS_PRODUCTION) {
    entry.tests = glob.sync('./tests/**/*.test.js');

    plugins.push(
      new HtmlWebpackPlugin({
        filename: 'tests/index.html',
        template: './tests/index.html',
        inject: 'head',
        scriptLoading: 'blocking',
        chunks: ['tests']
      })
    );
  }

  return {
    mode: IS_PRODUCTION ? 'production' : 'development',
    entry,
    plugins,
    target: 'web',
    module: {
      rules: [
        {
          test: /(\.ts|\.js|\.gts|\.gjs)$/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: [
                  '@glimmerx/babel-preset',
                  '@babel/preset-typescript',
                  '@babel/preset-env'
                ]
              }
            },
            '@glimmerx/webpack-loader'
          ]
        },

        {
          test: /\.(graphql|gql)$/,
          exclude: /node_modules/,
          loader: 'graphql-tag/loader'
        },

        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  config: path.resolve(__dirname, 'postcss.config.js')
                }
              }
            }
          ]
        },
        {
          test: /\.(png|svg|jpg|gif)$/,
          loader: 'file-loader',
          options: {
            outputPath: 'images'
          }
        }
      ]
    },
    resolve: {
      extensions: ['.ts', '.js', '.json', '.gts', '.gjs']
      // alias: {
      // 'glimmer-apollo/environment-glimmer':
      // 'glimmer-apollo/build/modules/addon/environment-glimmer.js'
      // }
    },
    output: {
      filename: '[name].bundle.js',
      path: path.resolve(__dirname, 'dist'),
      clean: true,
      publicPath: '/'
    },
    devServer: {
      contentBase: path.resolve(__dirname, 'dist')
    }
  };
};
