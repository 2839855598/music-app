<template>
  <!--添加歌曲页面-->
  <transition name="slide">
    <div class="add-song" v-show="showFlag" @click.stop>
      <!--头部标题-->
      <div class="header">
        <h1 class="title">添加歌曲到列表</h1>
        <div class="close" @click="hide">
          <i class="icon-close"></i>
        </div>
      </div>
      <!--搜索框-->
      <div class="search-box-wrapper">
        <search-box @query="onQueryChange" ref="searchBox"  placeholder="搜索歌曲"></search-box>
      </div>
      <!--搜索历史-->
      <div class="shortcut" v-show="!query">
        <switches
          :currentIndex="currentIndex"
          :switches="switches"
          @switch="switchItem"
        >
        </switches>
        <!--最近播放历史 和 历史搜索列表-->
        <div class="list-wrapper">
          <!--最近播放历史-->
          <scroll
            class="list-scroll"
            v-if="currentIndex === 0"
            :data="playHistory"
            ref="songList"
          >
            <div class="list-inner">
              <song-list @select="selectSong" :songs="playHistory" ></song-list>
            </div>
          </scroll>
          <!--历史搜索列表-->
          <scroll
            class="list-scroll"
            v-if="currentIndex === 1"
            :data="searchHistory"
            ref="searchList"
            :refreshDelay="refreshDelay"
          >
            <div class="list-inner">
              <search-list
                :searches="searchHistory"
                @select="addQuery"
                @delete="deleteSearchHistory"
              >
              </search-list>
            </div>
          </scroll>
        </div>
      </div>
      <!--搜索结果-->
      <div class="search-result" v-show="query">
        <suggest
          @select="saveSearchHistory(query)"
          @listenScroll="blurInput"
          :query="query"
          ref="suggest"
        ></suggest>
      </div>
      <!--添加歌曲成功提示框-->
      <top-tip ref="topTip">
        <div class="tip-title">
          <i class="icon-ok"></i>
          <span class="text">1首歌曲已经添加到播放列表</span>
        </div>
      </top-tip>
    </div>
  </transition>
</template>

<script>
    import SearchBox from '@baseComps/search-box/search-box';
    // 添加歌曲成功提示框
    import TopTip from '@baseComps/top-tip/top-tip';
    // 开关组件
    import Switches from '@baseComps/switches/switches';
    import Scroll from '@baseComps/scroll/scroll';
    import Suggest from '@components/suggest/suggest';
    import SongList from '@baseComps/song-list/song-list';
    import SearchList from '@baseComps/search-list/search-list';
    import { mapState, mapActions } from 'vuex';
    // mixins，一些通用地方
    import { searchMixin } from '@common/js/mixin';
    import Song from '@common/js/song';

    export default {
      name: 'add-song',
      mixins: [searchMixin],
      data() {
        return {
          showFlag: false,
          currentIndex: 0,
          switches: [
            {
              name: '最近播放',
            },
            {
              name: '搜索历史',
            },
          ],
        };
      },
      computed: {
        ...mapState([
          'playHistory',
        ]),
      },
      methods: {
        // 可供外部使用
        show() {
          this.showFlag = true;
          setTimeout(() => {
            if(this.currentIndex === 0) {
              this.$refs.songList.refresh();
            } else {
              this.$refs.searchList.refresh();
            }
          }, 20);
        },
        // 供内部使用
        hide() {
          this.showFlag = false;
        },
        // 选择开关
        switchItem(index) {
          this.currentIndex = index;
        },
        // 选择歌曲
        selectSong(song, index) {
          // 不选择第一个，因为第一个就是正在播放的
          if(index !== 0) {
            // 传递进入的是Song的实例，不是简单的一个对象
            this.insertSong(new Song(song));
          }
          // 显示提示框
          this.showTopTip();
        },
        // 显示提示框
        showTopTip() {
          this.$refs.topTip.show();
        },
        ...mapActions([
          'insertSong',
        ]),
      },
      components: {
        SearchBox,
        Suggest,
        Switches,
        Scroll,
        SongList,
        SearchList,
        TopTip,
      },
    };
</script>

<style lang="scss" scoped>
  .add-song {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    background: $color-background;
    &.slide-enter-active, &.slide-leave-active {
      transition: all 0.3s;
    }
    &.slide-enter, &.slide-leave-to {
      transform: translate3d(100%, 0, 0);
    }
    .header {
      position: relative;
      line-height: 88px;
      text-align: center;
      .title {
        font-size: $font-size-large;
        color: $color-text;
      }
      .close {
        position: absolute;
        top: 0;
        right: 16px;
        .icon-close {
          display: block;
          padding: 24px;
          font-size: 40px;
          color: $color-theme;
        }
      }
    }
    .search-box-wrapper {
      margin: 40px;
    }
    .shortcut {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      .list-wrapper {
        flex: 1;
        overflow: hidden;
        .list-scroll {
          height: 100%;
          overflow: hidden;
          .list-inner {
            padding: 40px 60px;
          }
        }
      }
    }
    .search-result {
      flex: 1;
      overflow: hidden;
    }
    /*提示框*/
    .tip-title {
      text-align: center;
      padding: 36px 0;
      font-size: 0;
      .icon-ok {
        font-size: $font-size-medium;
        color: $color-theme;
        margin-right: 8px;
      }
      .text {
        font-size: $font-size-medium;
        color: $color-text;
      }
    }
  }
</style>
