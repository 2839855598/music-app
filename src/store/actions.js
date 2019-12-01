import playMode from '@common/js/config';
import { shuffle } from '@common/js/util';
import { saveSearch, deleteSeach, clearSearch, savePlay, saveFavorite, deleteFavorite } from '@common/js/cache';
import * as types from './mutation-type';

// 当前歌曲在列表中的索引
function findIndex(list, song) {
  return list.findIndex(item => item.id === song.id);
}
// 选择播放
export const selectPlay = ({ commit, state }, { list, index }) => {
  commit(types.SET_SEQUENCE_LIST, list);
  // 随机模式的话
  if(state.mode === playMode.random) {
    const randomList = shuffle(list);
    commit(types.SET_PLAYLIST, randomList);
    index = findIndex(randomList, list[index]);
  } else {
    commit(types.SET_PLAYLIST, list);
  }
  commit(types.SET_CURRENT_INDEX, index);
  commit(types.SET_FULL_SCREEN, true);
  commit(types.SET_PLAYING_STATE, true);
};

// 随机播放
export const randomPlay = ({ commit }, { list }) => {
  // 随机模式播放
  commit(types.SET_PLAY_MODE, playMode.random);
  commit(types.SET_SEQUENCE_LIST, list);
  const randomlist = shuffle(list);
  commit(types.SET_PLAYLIST, randomlist);
  commit(types.SET_CURRENT_INDEX, 0);
  commit(types.SET_FULL_SCREEN, true);
  commit(types.SET_PLAYING_STATE, true);
};

export const insertSong = function ({ commit, state }, song) {
  // 播放列表

  const playList = state.playList.slice();
  const sequenceList = state.sequenceList.slice();
  // 下面这种会报错，因为都是引用类型，有可能会改变state中的playList或 sequenceList,
  // const { playList, sequenceList } = state;
  // 如果直接上面那种赋值的话 playList.splice会改变state.playList

  // state里面的索引是根据 playList来计算的
  let { currentIndex } = state;
  // 记录当前歌曲
  const currentSong = playList[currentIndex];
  // 查找当前播放列表中是否有待插入的歌曲并返回其索引
  const fpIndex = findIndex(playList, song);
  // 因为是插入歌曲，所以索引要 +1
  currentIndex++;
  // 插入这首歌到当前索引位置
  playList.splice(currentIndex, 0, song);
  // 插入后，如果已经包含了要插入的这首歌
  if(fpIndex > -1) {
    // 如果当前插入的序号大于列表中 重复存在的歌曲的序号
    if(currentIndex > fpIndex) {
      // 删除重复的歌曲,删除后数组长度减一
      playList.splice(fpIndex, 1);
      // 数组长度变了，所以当前索引也要减一
      currentIndex--;
    // 如果当前插入的序号小于列表中 重复存在的歌曲的序号
    } else {
      // 在重复歌曲前面插入会导致 以前的fpIndex向后挪一位
      playList.splice(fpIndex + 1, 1);
    }
  }

  // 顺序列表, 这里不需要currentIndex，因为 currentIndex根据playList计算来的

  const currentSertIndex = findIndex(sequenceList, currentSong) + 1;
  const fsIndex = findIndex(sequenceList, song);
  sequenceList.splice(currentSertIndex, 0, song);

  if(fsIndex > -1) {
    if(currentSertIndex > fsIndex) {
      sequenceList.splice(fsIndex, 1);
    } else {
      sequenceList.splice(fsIndex + 1, 1);
    }
  }
  commit(types.SET_PLAYLIST, playList);
  commit(types.SET_SEQUENCE_LIST, sequenceList);
  // 插入歌曲的索引
  commit(types.SET_CURRENT_INDEX, currentIndex);
  commit(types.SET_FULL_SCREEN, true);
  commit(types.SET_PLAYING_STATE, true);
};

// 保存搜索历史
export const saveSearchHistory = function ({ commit }, query) {
  // 保存查询数据到 vuex的搜索历史中
  commit(types.SET_SEARCH_HISTORY, saveSearch(query));
};

// 删除单个搜索历史
export const deleteSearchHistory = function ({ commit }, query) {
  // 删除vuex搜索历史中某个数据
  commit(types.SET_SEARCH_HISTORY, deleteSeach(query));
};

// 删除所有搜索历史
export const clearAllSearchHistory = function ({ commit }) {
  // 清空vuex中的搜索历史
  commit(types.SET_SEARCH_HISTORY, clearSearch());
};

export const deleteSong = function ({ commit, state }, song) {
  const playList = state.playList.slice();
  const sequenceList = state.sequenceList.slice();
  let { currentIndex } = state;
  // 删除歌曲在播放列表中的位置
  const playIndex = findIndex(playList, song);
  // 删除歌曲在展示中的顺序列表中的位置
  const sequenceIndex = findIndex(sequenceList, song);
  // 删除播放列表中的歌曲
  playList.splice(playIndex, 1);
  // 删除顺序列表中的歌曲
  sequenceList.splice(sequenceIndex, 1);

  // 删除歌曲在播放歌曲的前面，或者 当前歌曲是最后一个，并且删除的就是最后一个
  // 比如 8个数据，最后一位索引07, 删除一个后，7个数据，正好索引与数据长度7相等，
  // 7个数据，最后索引应该是 06, 所以currentIndex--;
  if(currentIndex > playIndex || currentIndex === playList.length) {
    currentIndex--;
  }

  commit(types.SET_PLAYLIST, playList);
  commit(types.SET_SEQUENCE_LIST, sequenceList);
  commit(types.SET_CURRENT_INDEX, currentIndex);

  // 删除完所有歌曲时候，为false
  // 没删完时候，应该为ture
  const playState = playList.length > 0;
  commit(types.SET_PLAYING_STATE, playState);
};

// 清空播放列表
export const clearSongList = function ({ commit }) {
  commit(types.SET_PLAYLIST, []);
  commit(types.SET_SEQUENCE_LIST, []);
  commit(types.SET_CURRENT_INDEX, -1);
  commit(types.SET_PLAYING_STATE, false);
};

// 保存到最近播放历史 列表中 和 本地 localStorage
export const savePlayHistory = function ({ commit }, song) {
  // 保存到最近播放历史
  commit(types.SET_PLAY_HISTORY, savePlay(song));
};

// 保存到收藏列表
export const saveFavoriteList = function ({ commit }, song) {
  commit(types.SET_FAVORITE_LIST, saveFavorite(song));
};

// 从收藏列表中删除（删除一个）
export const deleteFavoriteList = function ({ commit }, song) {
  commit(types.SET_FAVORITE_LIST, deleteFavorite(song));
};
