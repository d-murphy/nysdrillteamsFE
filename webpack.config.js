const path = require("path");
const webpack = require("webpack");

const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

module.exports = {
  entry: "./src/index.tsx",
  mode: "development",
  devServer: {
    hot: true,
    static: {
        publicPath: "/", 
        directory: path.join(__dirname, 'public'),
    },
    historyApiFallback: true
  },
  output: {
    filename: "bundle.js",
    path: path.resolve("dist"),
    publicPath: "/dist/",
  },
  module: {
    rules:[
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      }
    ], 
  },
  plugins: [
    new ReactRefreshWebpackPlugin(),
  ],
  resolve: {
      extensions: ['.tsx', '.ts', '.js']
  }
}