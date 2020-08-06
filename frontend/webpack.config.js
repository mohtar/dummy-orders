const path = require('path');

const isProduction = process.env.NODE_ENV == 'production';

module.exports = {
  module: {
    rules: [
      {
        test: /\.tsx$/,
        exclude: /node_modules/,
        use: 'ts-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {extensions: ['.mjs', '.js', '.tsx']},
  devtool: isProduction ? undefined : 'cheap-module-eval-source-map',
  mode: isProduction ? 'production' : 'development',
  entry: './src/client.tsx',
  target: 'web',
  output: {
    path: path.resolve(__dirname, 'static/js'),
    filename: '[name].js',
  },
};
