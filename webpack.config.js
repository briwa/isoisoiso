module.exports = {
  entry: './assets/js/app.js',

  output: {
    filename: './build/bundle.js',
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loaders: ['babel-loader'],
      },
    ],
  },
};
