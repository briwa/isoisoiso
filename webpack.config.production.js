const path = require('path');
const webpack = require('webpack');

const phaserModule = path.join(__dirname, '/node_modules/phaser-ce/');
const phaser = path.join(phaserModule, 'build/custom/phaser-split.js');
const pixi = path.join(phaserModule, 'build/custom/pixi.js');
const p2 = path.join(phaserModule, 'build/custom/p2.js');

const phaserPluginIsometric = path.join(__dirname, '/node_modules/phaser-plugin-isometric/dist/phaser-plugin-isometric.js');

module.exports = {
  entry: {
    app: path.join(__dirname, '/assets/js/app.js'),
    vendor: ['pixi', 'p2', 'phaser', 'phaser-plugin-isometric', 'webfontloader', 'pathfinding'],
  },

  output: {
    path: path.join(__dirname, '/dist'),
    filename: 'bundle.js',
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: ['/node_modules/', '/dist'],
        loaders: 'babel-loader',
        query: {
          presets: 'stage-2',
        },
      },
    ],

    rules: [
      { test: /pixi\.js/, use: ['expose-loader?PIXI'] },
      { test: /phaser-split\.js$/, use: ['expose-loader?Phaser'] },
      { test: /p2\.js/, use: ['expose-loader?p2'] },
      { test: /phaser-plugin-isometric\.js/, use: ['imports-loader?Phaser=phaser'] },
    ],
  },

  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filename: 'vendor.bundle.js',
    }),
    new webpack.optimize.UglifyJsPlugin({
      drop_console: true,
      minimize: true,
      output: {
        comments: false,
      },
    }),
  ],

  resolve: {
    alias: {
      phaser,
      pixi,
      p2,
      'phaser-plugin-isometric': phaserPluginIsometric,
    },
  },
};
