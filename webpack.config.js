const path = require("path");
const webpack = require("webpack");
require('dotenv').config(); 

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
    new webpack.DefinePlugin({
        SERVICE_URL: JSON.stringify(process.env.SERVICE_URL), 
        MAPS_API_KEY: JSON.stringify(process.env.MAPS_API_KEY),
        INSTANCE_URL: JSON.stringify(process.env.INSTANCE_URL)
    })
  ],
  resolve: {
      extensions: ['.tsx', '.ts', '.js']
  }
}