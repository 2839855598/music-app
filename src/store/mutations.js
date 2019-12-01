import * as types from './mutation-type';

const mutations = {
  [types.SET_SINGER](state, singer) {
    // 不是数组的话，可以直接赋值
    state.singer = singer;
  },
  // flag是Boolean类型，
  [types.SET_PLAYING_STATE](state, flag) {
    state.playing = flag;
  },
  [types.SET_FULL_SCREEN](state, flag) {
    state.fullScreen = flag;
  },
  [types.SET_PLAYLIST](state, list) {
    // 不能直接赋值list，会报错，
    state.playList = list.slice();
  },
  [types.SET_SEQUENCE_LIST](state, list) {
    state.sequenceList = list.slice();
  },
  [types.SET_PLAY_MODE](state, mode) {
    state.mode = mode;
  },
  [types.SET_CURRENT_INDEX](state, index) {
    state.currentIndex = index;
  },
  [types.SET_DISSC](state, dissC) {
    // 不是数组的话，可以直接赋值
    state.dissC = dissC;
  },
  [types.SET_TOP_LIST](state, topList) {
    // 不是数组的话，可以直接赋值
    state.topList = topList;
  },
  [types.SET_SEARCH_HISTORY](state, history) {
    // 不能直接赋值history，会报错
    state.searchHistory = history.slice();
  },
  [types.SET_PLAY_HISTORY](state, history) {
    // 不能直接赋值history，会报错
    state.playHistory = history.slice();
  },
  [types.SET_FAVORITE_LIST](state, list) {
    // 不能直接赋值list，会报错
    state.favoriteList = list.slice();
  },
};
export default mutations;
