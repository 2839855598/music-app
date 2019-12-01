<template>
  <!-- 搜索页面 -->
  <div class="search" ref="search">
    <!--搜索框-->
    <div class="search-box-wrapper">
      <search-box @query="onQueryChange" ref="searchBox"></search-box>
    </div>
    <!--热门标签及其搜索历史列表-->
    <div class="shortcut-wrapper"  v-show="!query">
      <!--滚动元素下面必须只有一个儿子节点，所以要包个div-->
      <scroll
        :refreshDelay="refreshDelay"
        class="shortcut"
        ref="shortcut"
        :data="shortcut"
      >
        <div>
          <!--热门标签-->
          <div class="hot-key">
            <h1 class="title">热门搜索</h1>
            <ul class="key-word">
              <li
                @click="addQuery(item.title)"
                class="item"
                v-for="(item, index) in hotKey"
                :key="index"
              >
                <span>{{item.title}}</span>
              </li>
            </ul>
          </div>
          <!--搜索历史-->
          <div class="search-history" v-show="searchHistory.length">
            <h1 class="title">
              <span class="text">搜索历史</span>
              <span class="clear" @click="showConfirm">
              <i class="icon-clear"></i>
            </span>
            </h1>
            <search-list
              @select="addQuery"
              @delete="deleteSearchHistory"
              :searches="searchHistory"
            ></search-list>
          </div>
        </div>
      </scroll>
    </div>
    <!--搜索到的歌曲列表-->
    <div class="search-result" v-show="query">
      <suggest
        @select="saveSearchHistory(query)"
        @listenScroll="blurInput"
        :query="query"
        ref="suggest"
      >
      </suggest>
    </div>
    <!--弹出框确认-->
    <confirm ref="confirm"
             @confirm="clearAllSearchHistory"
             text="是否清空所有搜索历史">
    </confirm>
    <!--点击搜索内容路由跳转出口-->
    <transition name="slide">
      <router-view></router-view>
    </transition>
  </div>
</template>

<script>
    // 搜索框
    import SearchBox from '@baseComps/search-box/search-box';
    // 历史列表
    import SearchList from '@baseComps/search-list/search-list';
    import Scroll from '@baseComps/scroll/scroll';
    // confirm框
    import Confirm from '@baseComps/confirm/confirm';
    // 搜索到的歌曲列表
    import Suggest from '@components/suggest/suggest';
    // mixins，一些通用地方
    import { playListMixin, searchMixin } from '@common/js/mixin';
    import { mapActions } from 'vuex';

    const ERROR_OK = 0;

    export default {
      name: 'search',
      mixins: [playListMixin, searchMixin],
      data() {
        return {
          hotKey: [],
        };
      },
      computed: {
        // 因为两个数据都是异步数据，并且不知道哪个最后加载完，
        // 所以要放在一起，让scroll组件判断
        shortcut() {
          return this.hotKey.concat(this.searchHistory);
        },
      },
      created() {
        // 获取搜索热门标签
        this._getHotKey();
      },
      methods: {
        // 处理当有音乐播放时候，滚动栏距离底部的高度为 mini-player的高度
        handlePlaylist(playList) {
          const bottom = playList.length > 0 ? `${this.miniHeight}px` : '';
          this.$refs.search.style.marginBottom = bottom;
          // 搜索历史栏 刷新滚动栏
          this.$refs.shortcut.refresh();
          // 搜索结果 刷新滚动栏
          this.$refs.suggest.refresh();
        },
        // 获取搜索热门标签
        _getHotKey() {
          this.$api.music.getHotKey()
            .then(({ data: { hotkey: { code, data: { vec_hotkey } } } }) => {
              if(ERROR_OK === code) {
                // 只获取10个数据
                this.hotKey = vec_hotkey.slice(0, 10);
              }
            });
        },
        // 展示confirm框
        showConfirm() {
          // 显示
          this.$refs.confirm.show();
        },
        ...mapActions([
          // 同时清除localStorage所有数据 和 vuex中搜索历史中所有数据
          'clearAllSearchHistory',
        ]),
      },
      watch: {
        // 当从query列表返回到 搜索历史 热门标签时候，不能滚动，
        // 需要刷新一下
        query(newVal) {
          if(!newVal) {
            setTimeout(() => {
              this.$refs.shortcut.refresh();
            }, 20);
          }
        },
      },
      components: {
        SearchBox,
        Suggest,
        SearchList,
        Confirm,
        Scroll,
      },
    };
</script>

<style lang="scss" scoped>
  .search {
    flex: 1;
    display: flex;
    flex-direction: column;
    // 搜索框
    .search-box-wrapper {
      margin: 40px;
    }
    // 热门搜索标签
    .shortcut-wrapper {
      flex: 1;
      overflow: hidden;
      .shortcut {
        height: 100%;
        overflow: hidden;
        // 热门标签
        .hot-key {
          margin: 0 40px 40px 40px;
          .title {
            margin-bottom: 40px;
            font-size: $font-size-medium;
            color: $color-text-l;
          }
          .key-word {
            font-size: 0;
            .item {
              display: inline-block;
              padding: 10px 20px;
              margin: 0 40px 20px 0;
              border-radius: 12px;
              background: $color-highlight-background;
              font-size: $font-size-medium;
              color: $color-text-d;
            }
          }
        }
        // 搜索历史
        .search-history {
          margin: 0 40px;
          .title {
            display: flex;
            align-items: center;
            height: 80px;
            font-size: $font-size-medium;
            color: $color-text-l;
            .text {
              flex: 1;
            }
          }
        }
      }
    }
    // 搜索结果列表
    .search-result {
      flex: 1;
      overflow: hidden;
    }
  }

  // 歌手详情页 入场动画
  .slide-enter-active, .slide-leave-active {
    transition: all 0.3s;
  }
  .slide-enter, .slide-leave-to {
    transform: translate3d(100%, 0, 0);
  }
</style>
