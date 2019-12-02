const modeUrlObj = {
  // 开发模式
  development: {
    publicPath: '/',
  },
  production: {
    // hash模式下用 './', history模式下, 如果部署在服务器根目录(/)下,
    // 用 '/', 如果部署在服务器子目录下(如: /music/)下, 就用
    // '/music/'
    publicPath: '/music/',
  },
  test: {
    publicPath: 'https://www.xxx',
  },
};

module.exports = modeUrlObj[process.env.NODE_ENV];
