const path = require('path');
const webpack = require('webpack');

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
    app: path.resolve(__dirname, 'src/app/index.js'),
    vendor: vendorEntries,
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },

  module: {
    rules: [
      { test: /\.js$/, use: ['babel-loader'], include: path.join(__dirname, 'src/app') },
      { test: /pixi\.js/, use: ['expose-loader?PIXI'] },
      { test: /phaser-split\.js$/, use: ['expose-loader?Phaser'] },
      { test: /p2\.js/, use: ['expose-loader?p2'] },
      { test: /phaser-plugin-isometric\.js/, use: ['imports-loader?Phaser=phaser-ce'] },
    ],
  },

  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      drop_console: true,
      minimize: true,
      output: {
        comments: false,
      },
    }),

    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filename: 'vendor.bundle.js',
    }),
  ],

  resolve: {
    alias: {
      pixi,
      p2,
      'phaser-ce': phaser,
      'phaser-plugin-isometric': phaserPluginIsometric,
    },
  },
};
