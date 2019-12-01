import playMode from '@common/js/config';
// 加载本地localStorage
import { loadSearch, loadPlay, loadFavorite } from '@common/js/cache';

const state = {
  singer: {},
  // 是否播放
  playing: false,
  // 是否全屏显示
  fullScreen: false,
  // 播放列表
  playList: [],
  // 播放列表
  sequenceList: [],
  // 播放模式，3种
  mode: playMode.sequence,
  // 当前索引
  currentIndex: -1,
  // 歌单对象
  dissC: {},
  // 排行榜详情页对象(不是数组)
  topList: {},
  // 搜索历史, 本地存储，方便刷新时候获取已经设置的
  searchHistory: loadSearch(),
  // 播放历史列表，本地存储，方便刷新时候获取已经设置的
  playHistory: loadPlay(),
  // 收藏(喜欢)列表
  favoriteList: loadFavorite(),
};
export default state;
