const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

/**@type {import('webpack').Configuration}*/
const config = {
  target: 'node', // VS Code扩展运行在Node.js环境中
  mode: 'none', // 这将保持源代码的调试体验

  entry: './src/extension.ts', // 扩展的入口点
  output: {
    // 输出bundle到'out'文件夹（配置在.vscode/launch.json中)
    path: path.resolve(__dirname, 'out'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2'
  },
  externals: {
    vscode: 'commonjs vscode' // vscode模块由VS Code运行时创建并注入
  },
  resolve: {
    // 支持阅读TypeScript和JavaScript文件，参考 https://github.com/TypeStrong/ts-loader
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      }
    ]
  },
  plugins: [
    // 复制资源文件到输出目录
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/resources',
          to: 'resources',
          globOptions: {
            ignore: ['**/.DS_Store'] // 忽略macOS系统文件
          }
        }
      ]
    })
  ],
  devtool: 'nosources-source-map',
  infrastructureLogging: {
    level: "log", // 启用日志记录以便调试webpack问题
  },
};

module.exports = config;
