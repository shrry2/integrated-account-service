const path = require('path');

const src  = path.resolve(__dirname, 'src');
const dist = path.resolve(__dirname, 'dist');

module.exports = (env, argv) => {
  let IS_DEV = true;

  if (argv.mode === 'production') {
    console.log('Webpack has been set to Production mode.');
    IS_DEV = false;
  } else {
    console.log('Webpack has been set to Development mode.');
  }

  return {
    watch: IS_DEV,
    entry: {
      main: src + '/main.js',
    },
    devtool: IS_DEV ? 'source-map' : 'none',
    output: {
      path: dist,
      filename: '[name].js'
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          loader: 'babel-loader'
        }
      ]
    }
  };
};