<template>
  <!--用户中心-->
  <transition name="slide">
    <div class="user-center">
      <!--返回-->
      <div class="back" @click="back">
        <i class="icon-back"></i>
      </div>
      <!--tab切换-->
      <div class="switches-wrapper">
        <switches
          :switches="switches"
          :currentIndex="currentIndex"
          @switch="switchItem"
        >
        </switches>
      </div>
      <!--随机播放全部-->
      <div class="play-btn" @click="random">
        <i class="icon-play"></i>
        <span class="text">随机播放全部</span>
      </div>
      <!--收藏列表 和 最近播放列表-->
      <div class="list-wrapper" ref="listWrapper">
        <!--收藏列表-->
        <scroll
          class="list-scroll"
          v-if="currentIndex === 0"
          :data="favoriteList"
          ref="favoriteList"
        >
          <div class="list-inner">
            <song-list @select="selectSong" :songs="favoriteList" ></song-list>
          </div>
        </scroll>
        <!--最近播放列表-->
        <scroll
          class="list-scroll"
          v-if="currentIndex === 1"
          :data="playHistory"
          ref="playList"
        >
          <div class="list-inner">
            <song-list @select="selectSong" :songs="playHistory" ></song-list>
          </div>
        </scroll>
      </div>
      <!--没有结果界面-->
      <div class="no-result-wrapper" v-show="noResult">
        <no-result :title="noResultDesc"></no-result>
      </div>
    </div>
  </transition>
</template>

<script>
    import Switches from '@baseComps/switches/switches';
    import Scroll from '@baseComps/scroll/scroll';
    import SongList from '@baseComps/song-list/song-list';
    import NoResult from '@baseComps/no-result/no-result';
    import { mapState, mapActions } from 'vuex';
    import { playListMixin } from '@common/js/mixin';
    import Song from '@common/js/song';

    export default {
      name: 'user-center',
      mixins: [playListMixin],
      data() {
        return {
          currentIndex: 0,
          switches: [
            {
              name: '我喜欢的',
            },
            {
              name: '最近听的',
            },
          ],
        };
      },
      computed: {
        // 没有结果界面
        noResult() {
          // 因为有两种列表，要分别判断
          // 收藏列表
          if(this.currentIndex === 0) {
            return !this.favoriteList.length;
          }
          // 最近播放列表
          return !this.playHistory.length;
        },
        // 没有结果的 文案
        noResultDesc() {
          // 收藏列表
          if (this.currentIndex === 0) {
            return '暂无收藏歌曲';
          }
          // 最近播放列表
          return '你还没有听过歌曲';
        },
        ...mapState([
          'favoriteList',
          'playHistory',
        ]),
      },
      methods: {
        // 处理当有音乐播放时候，滚动栏距离底部的高度为 mini-player的高度
        handlePlaylist(playList) {
          const bottom = playList.length > 0 ? `${this.miniHeight}px` : '';
          this.$refs.listWrapper.style.marginBottom = bottom;
          // 刷新滚动栏
          // 收藏列表，最近播放列表 要判断是否存在，因为用了 v-if指令，
          this.$refs.favoriteList ? this.$refs.favoriteList.refresh()
            : this.$refs.playList.refresh();
        },
        // 切换开关
        switchItem(index) {
          this.currentIndex = index;
        },
        // 返回上一页
        back() {
          this.$router.back();
        },
        // 选择歌曲
        selectSong(song) {
          // 插入的歌曲要是Song的实例，因为song的实例有getLyric等实例方法
          this.insertSong(new Song(song));
        },
        // 随机播放
        random() {
          // 因为有两个列表，要先确定是哪个列表的随机播放
          let list = this.currentIndex === 0 ? this.favoriteList : this.playHistory;
          // 把歌曲全部变成 Song实例
          list = list.map(song => new Song(song));
          this.randomPlay({
            list,
          });
        },
        ...mapActions([
          'insertSong',
          'randomPlay',
        ]),
      },
      components: {
        Switches,
        Scroll,
        SongList,
        NoResult,
      },
    };
</script>

<style lang="scss" scoped>
  .user-center {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1;
    display: flex;
    flex-direction: column;
    background: $color-background;
    &.slide-enter-active, &.slide-leave-active {
      transition: all 0.3s;
    }
    &.slide-enter, &.slide-leave-to {
      transform: translate3d(100%, 0, 0);
    }
    .back {
      position: absolute;
      margin-left: 12px;
      .icon-back {
        display: block;
        padding: 20px;
        font-size: $font-size-large-x;
        color: $color-theme;
      }
    }
    .switches-wrapper {
      margin: 20px 0 60px 0;
    }
    .play-btn {
      box-sizing: border-box;
      width: 270px;
      padding: 14px 0;
      margin: 0 auto;
      text-align: center;
      border: 2px solid  $color-text-l;
      color: $color-text-l;
      border-radius: 200px;
      font-size: 0;
      .icon-play {
        display: inline-block;
        vertical-align: middle;
        margin-right: 12px;
        font-size: $font-size-small;
      }
      .text {
        display: inline-block;
        vertical-align: middle;
        font-size: $font-size-small;
      }
    }
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
    .no-result-wrapper {
      position: absolute;
      width: 100%;
      top: 50%;
      transform: translateY(-50%);
    }
  }
</style>
