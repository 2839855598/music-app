// 保存到本地 localStorage
import storage from 'good-storage';

// 搜索历史
const SEARCH_KEY = '__search__';
const SEARCH_MAX_LENGTH = 15;

// 播放历史
const PLAY_KEY = '__play__';
// 最大个数
const PLAY_MAX_LENGTH = 50;

// 收藏列表
const FAVORITE_KEY = '__favorite__';
// 最大个数
const FAVORITE_MAX_LENGTH = 100;

// 插入到数组最前面，如果已经存在，删除
function insertArray(arr, val, compare, maxLen) {
  const index = arr.findIndex(compare);
  // 如果存在，且在最开头，什么都不做
  if(index === 0) {
    return;
  }
  // 如果存在，但没在前头
  if(index > 0) {
    arr.splice(index, 1);
  }
  // 添加在数组最前面
  arr.unshift(val);
  if(maxLen && arr.length > maxLen) {
    // 删除尾部
    arr.pop();
  }
}

// 删除数组中某个元素
function removeFromArray(arr, val, compare) {
  const index = arr.findIndex(compare);
  // 如果存在的话
  if(index > -1) {
    arr.splice(index, 1);
  }
}

// 设置localStorage
export function saveSearch(query) {
  // 默认数组
  const searches = storage.get(SEARCH_KEY, []);
  insertArray(searches, query, item => item === query, SEARCH_MAX_LENGTH);
  // 设置到localStorage
  storage.set(SEARCH_KEY, searches);
  // 外部vuex还要用到，所以要return
  return searches;
}

// 获取localStorage
export function loadSearch() {
  return storage.get(SEARCH_KEY, []);
}

// 删除搜索历史
export function deleteSeach(query) {
  const searches = storage.get(SEARCH_KEY, []);
  removeFromArray(searches, query, item => item === query);
  // 设置到localStorage
  storage.set(SEARCH_KEY, searches);
  // 外部vuex还要用到，所以要return
  return searches;
}

// 删除所有搜索历史
export function clearSearch() {
  storage.remove(SEARCH_KEY);
  return [];
}

// 保存当前播放的歌曲 到最近播放历史中
export function savePlay(song) {
  const songs = storage.get(PLAY_KEY, []);
  insertArray(songs, song, item => item.id === song.id, PLAY_MAX_LENGTH);
  // 设置到localStorage
  storage.set(PLAY_KEY, songs);
  // 外部vuex还要用到，所以要return
  return songs;
}

// 加载播放历史
export function loadPlay() {
  return storage.get(PLAY_KEY, []);
}

// 保存到 本地 localStorage  和 vuex收藏列表
export function saveFavorite(song) {
  const favorites = storage.get(FAVORITE_KEY, []);
  insertArray(favorites, song, item => item.id === song.id, FAVORITE_MAX_LENGTH);
  storage.set(FAVORITE_KEY, favorites);
  return favorites;
}

// 删除 本地 localStorage 和vuex 收藏列表
export function deleteFavorite(song) {
  const favorites = storage.get(FAVORITE_KEY, []);
  removeFromArray(favorites, song, item => item.id === song.id);
  storage.set(FAVORITE_KEY, favorites);
  return favorites;
}

// 加载 本地 localStorage 和vuex 收藏列表（刷新页面时候加载）
export function loadFavorite() {
  return storage.get(FAVORITE_KEY, []);
}
