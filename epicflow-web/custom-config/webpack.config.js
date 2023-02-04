const isDevelopment = process.env.NODE_ENV === 'development';
const path = require('path');
const fs = require('fs');
const paths = require('./paths');
const webpack = require('webpack');
const getClientEnvironment = require('./env');
const env = getClientEnvironment(paths.publicUrlOrPath.slice(0, -1));
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);
const moduleFileExtensions = [
  'web.mjs',
  'mjs',
  'web.js',
  'js',
  'web.ts',
  'ts',
  'web.tsx',
  'tsx',
  'json',
  'web.jsx',
  'jsx',
];
// Resolve file paths in the same order as webpack
const resolveModule = (resolveFn, filePath) => {
  const extension = moduleFileExtensions.find(extension =>
    fs.existsSync(resolveFn(`${filePath}.${extension}`))
  );

  if (extension) {
    return resolveFn(`${filePath}.${extension}`);
  }

  return resolveFn(`${filePath}.js`);
};

module.exports = {
  entry:resolveModule(resolveApp, 'src/wc/index'),
  // devtool: 'inline-source-map',
  module: {
    rules: [
      // {
      //   enforce: 'pre',
      //   exclude: /@babel(?:\/|\\{1,2})runtime/,
      //   test: /\.(js|mjs|jsx|ts|tsx|css)$/,
      //   loader: require.resolve('source-map-loader'),
      // },
      {
        test: /\.(tsx|jsx|ts)?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: 'custom-config/tsconfig.json',
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
      },
      {
              test: /\.css$/,
              use: 'raw-loader'
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
  pluings: [
    new webpack.DefinePlugin(env.stringified),
  ].filter(Boolean),
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.scss', '.css','.jsx'],
  },
  output: {
    filename: 'epicflow-webcomponents.js',
    path: path.resolve(__dirname, './dist'),
  },
};