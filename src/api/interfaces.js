const ports = {
  development: '/',
  // 服务器有多个项目时候,production用具体的,只有单个项目时候(以/开头)
  // production 用 /
  production: 'http://xujiacheng.online/music/',
};
export default ports[process.env.NODE_ENV];
