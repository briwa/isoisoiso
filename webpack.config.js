// TODO:
// - webpack blocks?

const path = require('path');
const webpack = require('webpack');

const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

// we can optimize this by only extracting to file in production
// but for now, just do it for both env
// info: https://github.com/webpack-contrib/sass-loader#in-production
const extractSass = new ExtractTextPlugin({
  filename: 'style.css',
  disable: false,
});

// had to do this for phaser custom bundle
// for more info: https://github.com/photonstorm/phaser-ce#webpack
const phaserModule = path.join(__dirname, '/node_modules/phaser-ce/');
const phaser = path.join(phaserModule, 'build/custom/phaser-split.js');
const pixi = path.join(phaserModule, 'build/custom/pixi.js');
const p2 = path.join(phaserModule, 'build/custom/p2.js');
const phaserPluginIsometric = path.join(__dirname, '/node_modules/phaser-plugin-isometric/dist/phaser-plugin-isometric.js');

const vendorEntries = [
  'pixi',
  'p2',
  'phaser-ce',
  'phaser-plugin-isometric',
  'webfontloader',
  'pathfinding',
];

module.exports = {
  entry: {
    app: [
      path.resolve(__dirname, 'src/app/index.ts'),
      path.resolve(__dirname, 'src/styles/main.scss'),
    ],
    vendor: vendorEntries,
  },

  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },

  devServer: {
    publicPath: '/dist/',
  },

  devtool: 'cheap-source-map',

  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        include: path.join(__dirname, 'src/app'),
      },
      {
        test: /pixi\.js/,
        loader: 'expose-loader?PIXI',
      },
      {
        test: /phaser-split\.js$/,
        loader: 'expose-loader?Phaser',
      },
      {
        test: /p2\.js/,
        loader: 'expose-loader?p2',
      },
      {
        test: /phaser-plugin-isometric\.js/,
        loader: 'imports-loader?Phaser=phaser-ce',
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        include: path.join(__dirname, 'src/styles'),
        loader: extractSass.extract({
          use: [
            'css-loader',
            {
              loader: 'sass-loader',
              query: {
                sourceMap: false,
              },
            },
          ],
          fallback: 'style-loader',
        }),
      },
    ],
  },

  plugins: [
    new ForkTsCheckerWebpackPlugin(),

    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filename: 'vendor.bundle.js',
    }),

    extractSass,
  ],

  resolve: {
    modules: [
      path.resolve(__dirname, './'),
      path.resolve(__dirname, 'node_modules'),
    ],
    extensions: ['.js', '.ts'],
    alias: {
      pixi,
      p2,
      'phaser-ce': phaser,
      'phaser-plugin-isometric': phaserPluginIsometric,
    },
  },
};
