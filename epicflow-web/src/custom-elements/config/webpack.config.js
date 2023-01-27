const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const isDevelopment = process.env.NODE_ENV === 'development';

module.exports = {
  entry: ['./src/custom-elements/app-element.tsx', './src/custom-elements/app-new-element.tsx'],
  // devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: 'src/custom-elements/config/tsconfig.json',
            },
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        use: [
          'raw-loader',
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                includePaths: [path.resolve(__dirname, 'node_modules')]
              }
            }
          }
        ]
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: 'svg-url-loader',
            options: {
              limit: 10000,
            },
          },
        ],
      }
      // {
      //   test: /\.css$/i,
      //   use: [
      //     {
      //       loader: 'style-loader',
      //       options: {
      //         injectType: 'styleTag'
      //       }
      //     },
      //     'css-loader'
      //   ],
      // },
      // {
      //   test: /\.module\.(scss|sass)$/i,
      //   exclude: /node_modules/,
      //   use: [
      //     "sass-to-string",
      //     {
      //       loader: "sass-loader",
      //       options: {
      //         sassOptions: {
      //           outputStyle: "compressed",
      //         },
      //       },
      //     },
      //   ],
      // },
      // {
      //   test: /\.module\.(scss|sass)$/i,
      //   //exclude: /\.module.scss$/,
      //   use: [
      //     'style-loader',
      //     {
      //       loader: 'style-loader'
      //     },
      //     {
      //       loader: 'css-loader',
      //       options: {
      //         sourceMap: isDevelopment,
      //         modules: true
      //       },
      //     },
      //     {
      //       loader: 'sass-loader',
      //       options: {
      //         sourceMap: isDevelopment,
      //       },
      //     }
      //   ],
      // },
      // {
      //   test: /\.(scss|sass)$/i,
      //   exclude: /\.module.scss$/,
      //   loader: [
      //     'style-loader',
      //     {
      //       loader: 'css-loader',
      //       options: {
      //         sourceMap: isDevelopment,
      //       },
      //     },
      //     {
      //       loader: 'sass-loader',
      //       options: {
      //         sourceMap: isDevelopment,
      //       },
      //     },
      //   ],
      // },
      // {
      //   test: /\.scss$/i,
      //   exclude: /\.module.scss$/,
      //   use: [
      //     'style-loader',
      //     {
      //       loader: 'css-loader'
      //     },
      //     {
      //       loader: 'sass-loader',
      //       options: {
      //         sourceMap: isDevelopment,
      //       },
      //     },
      //   ],
      // },
      ,
      // {
      //   test: /\.scss$/,
      //   use: [
      //     {
      //       loader: 'style-loader',
      //       options: {
      //         injectType: 'singletonStyleTag',
      //         // insert: function addToWindowObject(element) {
      //         //   const _window = typeof window !== 'undefined' ? window : {};
      //         //   if (!_window.myCustomElementStyles) {
      //         //     _window.myCustomElementStyles = [];
      //         //   }
      //         //   element.classList.add('my-custom-element-styles');
      //         //   _window.myCustomElementStyles.push(element);
      //         // },
      //       },
      //     },
      //     'css-loader',
      //     {
      //       loader: 'sass-loader',
      //       options: {
      //         sassOptions: {
      //           outputStyle: 'compressed',
      //         },
      //       },
      //     },
      //   ],
      //   exclude: /node_modules/,
      // },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.scss', '.css'],
  },
  output: {
    filename: 'epicflow-webcomponents.js',
    path: path.resolve(__dirname, './dist'),
  },
};