const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true, // 转译依赖
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // 本地后端服务器地址
        changeOrigin: true, // 允许跨域
      },
      '/avatar': {
        target: 'http://localhost:3000', // 本地后端服务器地址
        changeOrigin: true, // 允许跨域
      },
    },
  },
  lintOnSave: false, // 禁用保存时的代码检查
  publicPath: '/', // 部署应用时的基本 URL
});
