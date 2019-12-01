// 作用是每个有滚动的组件里都要调用playList方法，来重新计算滚动的高度，
// 因为mini歌曲栏会挡住滚动栏的最后一个数据，所以要margin-bottom
// 距离等于 mini歌曲栏高度
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';
import playMode from '@common/js/config';
import { shuffle } from '@common/js/util';


export const playListMixin = {
  data() {
    return {
      clientWidth: 0,
    };
  },
  computed: {
    ...mapState([
      'playList',
    ]),
    miniHeight() {
      // 动态计算mini的高度
      const percent = 120 / 750;
      return Math.floor(this.clientWidth * percent);
    },
  },
  mounted() {
    // 当pc模式切换为手机模式，window.innerWidth是pc端的,不是手机端的
    // 所以要监听变化
    window.addEventListener('resize', () => {
      this.clientWidth = window.innerWidth;
    });
    this.clientWidth = window.innerWidth;
    this.handlePlaylist(this.playList);
  },
  // tab切换时候
  activated() {
    this.handlePlaylist(this.playList);
  },
  // 告诉组件必须重写handlePlaylist方法，重写后，就执行重写后的方法，
  // 如果不重写，就执行mixin中的handlePlaylist方法
  methods: {
    handlePlaylist() {
      throw new Error('component must implement handlePlaylist method');
    },
  },
  watch: {
    playList(newVal) {
      this.handlePlaylist(newVal);
    },
  },
};

// player与playerlist组件共享
export const playMixin = {
  computed: {
    // 播放三种模式
    iconMode() {
      return this.mode === playMode.sequence ? 'icon-sequence'
        : this.mode === playMode.loop ? 'icon-loop'
          : 'icon-random';
    },
    ...mapState([
      'sequenceList',
      'mode',
      'playList',
      'favoriteList',
    ]),
    ...mapGetters([
      'currentSong',
    ]),
  },
  methods: {
    // 切换播放模式
    changeMode() {
      const mode = (this.mode + 1) % 3;
      this.setPlayMode(mode);
      // 列表也变化
      let list = null;
      if(mode === playMode.random) {
        list = shuffle(this.sequenceList);
      } else {
        list = this.sequenceList;
      }
      // 改变列表前，重置一下索引currentIndex
      this._restCurrentIndex(list);
      this.setPlayList(list);
    },
    // 重置列表索引
    _restCurrentIndex(arr) {
      const index = arr.findIndex(item => item.id === this.currentSong.id);
      this.setCurrentIndex(index);
    },
    // 切换收藏 和 取消收藏的样式
    getFavoriteIcon(song) {
      if(this.isFavorite(song)) {
        return 'icon-favorite';
      }
      return 'icon-not-favorite';
    },
    // 切换 收藏 或 取消收藏
    toggleFavorite(song) {
      if(this.isFavorite(song)) {
        this.deleteFavoriteList(song);
      } else {
        this.saveFavoriteList(song);
      }
    },
    // 是否收藏过
    isFavorite(song) {
      const index = this.favoriteList.findIndex(item => item.id === song.id);
      return index > -1;
    },
    ...mapMutations({
      setPlayingState: 'SET_PLAYING_STATE',
      setCurrentIndex: 'SET_CURRENT_INDEX',
      setPlayMode: 'SET_PLAY_MODE',
      setPlayList: 'SET_PLAYLIST',
    }),
    ...mapActions([
      'saveFavoriteList',
      'deleteFavoriteList',
    ]),
  },
};

// search.vue 与 add-song 组件 共享
export const searchMixin = {
  data() {
    return {
      query: '',
      refreshDelay: 100,
    };
  },
  computed: {
    ...mapState([
      'searchHistory',
    ]),
  },
  methods: {
    // input失去焦点（移动端测试过，可以用，一滚动搜索列表就input失去焦点）
    blurInput() {
      // 调用子组件失去焦点方法
      this.$refs.searchBox.blur();
    },
    // input搜索关键词改变
    onQueryChange(query) {
      this.query = query;
    },
    // 添加到input查询
    addQuery(item) {
      this.$refs.searchBox.setQuery(item);
    },
    ...mapActions([
      // 同时保存到本地localStorage和vuex搜索历史数组中
      'saveSearchHistory',
      // 同时删除localStorage某个数据 和 vuex中搜索历史某个数据
      'deleteSearchHistory',
    ]),
  },
};
