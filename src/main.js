import Vue from 'vue';
// 解决移动端点击300ms延迟
import fastclick from 'fastclick';
// 图片懒加载
import VueLazyload from 'vue-lazyload';
import App from './App';
import router from './router';
import store from './store';
// 字体，base
import './common/scss/index.scss';

import api from './api/index';


// body内的div点击不会有300ms延迟
fastclick.attach(document.body);

Vue.use(VueLazyload, {
  loading: require('./common/image/default.png'),
});


Vue.prototype.$api = api;
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
