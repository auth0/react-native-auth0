const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const appDirectory = path.resolve(__dirname);

// This is needed for webpack to compile JavaScript.
// Many OSS React Native packages are not compiled to ES5 before being
// published. If you depend on uncompiled packages they may cause webpack build
// errors. To fix this webpack can be configured to compile to the necessary
// `node_module`.
const babelLoaderConfiguration = {
  test: /\.(js|jsx|ts|tsx)$/,
  // Add every directory that needs to be compiled by Babel during the build.
  include: [
    path.resolve(appDirectory, 'index.js'),
    path.resolve(appDirectory, 'src'),
    path.resolve(appDirectory, '../src'), // Included react-native-auth0 source
    path.resolve(__dirname, 'node_modules/@react-navigation'),
    path.resolve(__dirname, 'node_modules/react-native-safe-area-context'),
    path.resolve(__dirname, 'node_modules/react-native-screens'),
    path.resolve(__dirname, 'node_modules/react-native-vector-icons'),
  ],
  use: {
    loader: 'babel-loader',
    options: {
      cacheDirectory: true,
      // The 'metro-react-native-babel-preset' preset is recommended to match React Native's packager
      presets: ['@react-native/babel-preset'],
      // Re-write paths to import only the modules needed by the app
      plugins: ['react-native-web'],
    },
  },
};

// This is needed for webpack to import static images in JavaScript files.
const imageLoaderConfiguration = {
  test: /\.(gif|jpe?g|png|svg)$/,
  use: {
    loader: 'url-loader',
    options: {
      // name: '[name].[ext]',
      esModule: false,
    },
  },
};

module.exports = {
  entry: [
    // load any web API polyfills
    // path.resolve(appDirectory, 'polyfills-web.js'),
    // your web-specific entry file
    path.resolve(appDirectory, 'index.js'),
  ],

  // configures where the build ends up
  output: {
    filename: 'bundle.web.js',
    path: path.resolve(appDirectory, 'dist'),
  },

  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 3000,
    historyApiFallback: true,
    hot: true,
    client: {
      webSocketTransport: 'ws',
      overlay: {
        errors: true,
        warnings: false,
      },
    },
    webSocketServer: 'ws',
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(appDirectory, 'public/index.html'),
    }),
  ],

  module: {
    rules: [babelLoaderConfiguration, imageLoaderConfiguration],
  },

  resolve: {
    // This will only alias the exact import "react-native"
    alias: {
      'react-native$': 'react-native-web',
      'react-native-auth0': path.resolve(__dirname, '../src'),
    },
    // Add module resolution paths to help webpack find react-native-web
    modules: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, '../node_modules'),
      'node_modules',
    ],
    // If you're working on a multi-platform React Native app, web-specific
    // module implementations should be written in files using the extension
    // `.web.js`.
    extensions: [
      '.web.js',
      '.web.ts',
      '.web.jsx',
      '.web.tsx',
      '.js',
      '.ts',
      '.tsx',
    ],
  },
};
