const path = require('path');
const baseConf = require('./src/envURL/index.js');
const axios = require('axios');
const express = require('express');
const handleRouters = require('./src/api/router.js');
function resolve(url) {
  return path.resolve(__dirname, url);
}

module.exports = {
  publicPath: baseConf.publicPath,
  chainWebpack: config => {
    config
      .resolve
      .alias
      .set('@components', resolve('src/components'))
      .set('@baseComps', resolve('src/baseComps'))
      .set('@common', resolve('src/common'))
  },
  css: {
    loaderOptions: {
      sass: {
        prependData: `
         @import '@/common/scss/variable.scss';
         @import '@/common/scss/mixin.scss';
        `
      }
    }
  },
  devServer: {
    port: 8900,
    open: true,
    hot: true,
    before: app => {
      handleRouters(app, axios, express.Router());
    },
    /* proxy: {
      '/api/getPicList': {
         target: 'https://c.y.qq.com/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg',
         changeOrigin: true,
         pathRewrite: {
          '^/api/getPicList': ''
        }
      }
    } */
  }
}
