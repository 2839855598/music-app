<template>
  <!-- 歌手页面 -->
  <div class="singer" ref="singer">
    <listview @select="selectSinger" :data="singers" ref="listView"></listview>
    <!--歌手详情页出口-->
    <transition name="slide">
      <router-view></router-view>
    </transition>
  </div>
</template>

<script>
    // 汉字转为拼音
    import pinyin from 'pinyin';
    // 歌手列表
    import Listview from '@baseComps/listview/listview';
    import Singer from '@common/js/singer';
    // mixins，一些通用地方
    import { playListMixin } from '@common/js/mixin';
    // mutations语法糖
    import { mapMutations } from 'vuex';

    const HOT_NAME = '热门';
    const HOT_LEN = 10;
    const ERROR_OK = 0;

    export default {
      name: 'singer',
      mixins: [playListMixin],
      data() {
        return {
          singers: [],
        };
      },
      created() {
        // 获取歌手数据
        this._getSingerList();
      },
      methods: {
        // 处理当有音乐播放时候，滚动栏距离底部的高度为 mini-player的高度
        handlePlaylist(playList) {
          const bottom = playList.length > 0 ? `${this.miniHeight}px` : '';
          this.$refs.singer.style.marginBottom = bottom;
          // 刷新滚动栏
          this.$refs.listView.refresh();
        },
        // 获取歌手数据
        _getSingerList() {
          this.$api.music.getSingerList()
            .then(({ data: { code, singerList: { data: { singerlist } } } }) => {
              if(code === ERROR_OK) {
                // 增加首字母属性
                this._addFirstName(singerlist);
                // 把格式化后的数据给singers
                this.singers = this._normalizeSinger(singerlist);
              }
            });
        },
        // 增加首字母属性
        _addFirstName(arr) {
          arr.forEach((item) => {
            // 直接对item增删属性会报eslint错误
            const current = item;
            current.nameFirst = pinyin(item['singer_name'], {
              // 拼音风格
              style: pinyin.STYLE_NORMAL,
            })[0][0].charAt(0).toUpperCase();
          });
        },
        // 格式化歌手数据
        _normalizeSinger(arr) {
          const map = {
            hot: {
              title: HOT_NAME,
              list: [],
            },
          };
          arr.forEach((item, index) => {
            // 热门 10个数据
            if(index < HOT_LEN) {
              map.hot.list.push(new Singer({
                id: item['singer_id'],
                mid: item['singer_mid'],
                name: item['singer_name'],
              }));
            }
            const key = item.nameFirst;
            if(!map[key]) {
              map[key] = {
                title: key,
                list: [],
              };
            }
            map[key].list.push(new Singer({
              id: item['singer_id'],
              mid: item['singer_mid'],
              name: item['singer_name'],
            }));
          });
          // 为了得到有序的数组，处理map
          const hot = [];
          const ret = [];
          Object.values(map).forEach((item) => {
            if(/[a-zA-Z]/.test(item.title)) {
              ret.push(item);
            } else if (item.title === HOT_NAME) {
              hot.push(item);
            }
          });
          // 字母数组按照顺序
          // 也可以a.title.localeCompare(b.title);
          // 上面这种方法也可以准确排序中文(根据中文的英文首字母排序)
          ret.sort((a, b) => a.title.charCodeAt(0) - b.title.charCodeAt(0));
          // 返回按照顺序格式的一维数组
          return hot.concat(ret);
        },
        // 跳转到歌手详情页
        selectSinger(singer) {
          this.$router.push({
            // path: `/singer/${singer.mid}`,
            // path 或者name+params 组合
            name: 'singer-detail',
            params: {
              mid: singer.mid,
            },
          });
          this.setSinger(singer);
        },
        // vuex中的mutations映射
        ...mapMutations({
          setSinger: 'SET_SINGER',
        }),
      },
      components: {
        Listview,
      },
    };
</script>

<style lang="scss" scoped>
  .singer {
    flex: 1;
    // 超出可视高度隐藏
    overflow: hidden;
    position: relative;
  }
  // 歌手详情页 入场动画
  .slide-enter-active, .slide-leave-active {
    transition: all 0.3s;
  }
  .slide-enter, .slide-leave-to {
    transform: translate3d(100%, 0, 0);
  }
</style>
