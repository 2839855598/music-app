import Vue from 'vue';
import Vuex from 'vuex';
// 日志信息
import createLogger from 'vuex/dist/logger';
import state from './state';
import mutations from './mutations';
import * as getters from './getters';
import * as actions from './actions';

Vue.use(Vuex);
// 开发模式调试
const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
  state,
  getters,
  mutations,
  actions,
  strict: debug,
  plugins: debug ? [createLogger()] : [],
  modules: {
  },
});
