const path = require('path');

const TerserPlugin = require('terser-webpack-plugin'); // minify for production build
const { CleanWebpackPlugin } = require('clean-webpack-plugin'); // cleaning dist directory on each build

const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // make CSS external file
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin'); // minify CSS

const autoprefixer = require('autoprefixer');

const src = path.resolve(__dirname, 'src');
const dist = path.resolve(__dirname, 'dist/bundles');

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
      main: `${src}/js/main.jsx`,
      style: `${src}/styles/style.scss`,
      signup: `${src}/js/pages/signup/index.jsx`,
    },
    devtool: IS_DEV ? 'source-map' : 'none',
    output: {
      path: dist,
      filename: IS_DEV ? 'DEV/[name].js' : '[hash]/[name].js',
    },
    optimization: {
      minimize: true,
      minimizer: IS_DEV
        ? [new OptimizeCSSAssetsPlugin({})]
        : [
          new TerserPlugin({
            terserOptions: {
              output: {
                comments: false,
              },
            },
            extractComments: false,
          }),
          new OptimizeCSSAssetsPlugin({}),
        ],
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
        },
        {
          test: /\.scss$/,
          use: [
            { loader: MiniCssExtractPlugin.loader },
            {
              loader: 'css-loader',
              options: {
                url: false,
                sourceMap: IS_DEV,
                importLoaders: 2,
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                sourceMap: IS_DEV,
                plugins: [
                  autoprefixer({
                    grid: true,
                  }),
                ],
              },
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: IS_DEV,
              },
            },
          ],
        },
      ],
    },
    resolve: {
      extensions: ['.js', '.jsx'],
    },
    plugins: [
      new CleanWebpackPlugin(),
      new MiniCssExtractPlugin({ filename: IS_DEV ? 'DEV/[name].css' : '[hash]/[name].css' }),
    ],
  };
};
