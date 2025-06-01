const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const appDirectory = path.resolve(__dirname);

// This is needed for webpack to compile JavaScript.
// Many OSS React Native packages are not compiled to ES5 before being
// published. If you depend on uncompiled packages they may cause webpack build
// errors. To fix this webpack can be configured to compile to the necessary
// `node_module`.
const babelLoaderConfiguration = {
  test: /\.js$|tsx?$/,
  // Add every directory that needs to be compiled by Babel during the build.
  include: [
    path.resolve(__dirname, 'index.web.js'), // Entry to your application
    path.resolve(__dirname, 'src'),
    path.resolve(__dirname, '../src'), // Include the react-native-auth0 source
    path.resolve(__dirname, 'node_modules/react-native-uncompiled'),
    path.resolve(__dirname, 'node_modules/@react-navigation'),
    path.resolve(__dirname, 'node_modules/react-native-safe-area-context'),
    path.resolve(__dirname, 'node_modules/react-native-screens'),
    path.resolve(__dirname, 'node_modules/react-native-paper'),
    path.resolve(__dirname, 'node_modules/react-native-vector-icons'),
  ],
  use: {
    loader: 'babel-loader',
    options: {
      cacheDirectory: true,
      // The 'metro-react-native-babel-preset' preset is recommended to match React Native's packager
      presets: ['@react-native/babel-preset'],
      // Remove the problematic plugins for now
      plugins: ['react-native-paper/babel'],
    },
  },
};

// This is needed for webpack to import static images in JavaScript files.
const imageLoaderConfiguration = {
  test: /\.(gif|jpe?g|png|svg)$/,
  use: {
    loader: 'url-loader',
    options: {
      name: '[name].[ext]',
      esModule: false,
    },
  },
};

const fontLoaderConfiguration = {
  test: /\.(woff|woff2|eot|ttf|otf)$/,
  use: {
    loader: 'file-loader',
    options: {
      name: '[name].[ext]',
      outputPath: 'fonts/',
    },
  },
};

module.exports = {
  entry: {
    app: path.join(__dirname, 'index.web.js'),
  },
  output: {
    path: path.resolve(appDirectory, 'dist'),
    publicPath: '/',
    filename: 'rnw_auth0_example.bundle.js',
  },
  resolve: {
    // This will only alias the exact import "react-native"
    alias: {
      'react-native$': 'react-native-web',
      'react-native-linear-gradient': 'react-native-web-linear-gradient',
      'react-native-vector-icons/MaterialIcons':
        'react-native-vector-icons/dist/MaterialIcons',
      'react-native-vector-icons/MaterialCommunityIcons':
        'react-native-vector-icons/dist/MaterialCommunityIcons',
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
    extensions: ['.web.js', '.js', '.ts', '.tsx'],
  },
  module: {
    rules: [
      babelLoaderConfiguration,
      imageLoaderConfiguration,
      fontLoaderConfiguration,
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'public/index.html'),
    }),
  ],
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
};
