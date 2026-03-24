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
    filename: "[name].js",
    path: path.resolve("dist"),
    publicPath: "/dist/",
  },
  optimization: {
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
        },
      },
    },
  },
  module: {
    rules:[
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      }
    ],
  },
  plugins: [
    new ReactRefreshWebpackPlugin(),
    new webpack.DefinePlugin({
        SERVICE_URL: JSON.stringify(process.env.SERVICE_URL), 
        MAPS_API_KEY: JSON.stringify(process.env.MAPS_API_KEY)
    })
  ],
  resolve: {
      extensions: ['.tsx', '.ts', '.js']
  }
}