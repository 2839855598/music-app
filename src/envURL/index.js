const modeUrlObj = {
  // 开发模式
  development: {
    publicPath: '/',
  },
  production: {
    publicPath: '/music/',
  },
  test: {
    publicPath: 'https://www.xxx',
  },
};

module.exports = modeUrlObj[process.env.NODE_ENV];
