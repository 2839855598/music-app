<template>
  <div class="music-list">
    <div class="avatar" ref="avatar">
      <!--返回按钮-->
      <div class="back" @click="back">
        <i class="icon-back"></i>
      </div>
      <!--标题-->
      <h1 class="title" v-html="title"></h1>
      <!--背景图-->
      <div class="bg-image" :style="bgStyle" ref="bgImage">
        <!--遮罩层-->
        <div class="filter" ref="filter"></div>
      </div>
      <!--随机播放全部-->
      <div class="play-wrapper" @click="randomPlaying">
        <div class="play"  ref="playBtn" v-show="songs && songs.length">
          <i class="icon-play"></i>
          <span class="text">随机播放全部</span>
        </div>
      </div>
    </div>
    <!--滚动列表往下滚动时候跟随滚动的层-->
    <div class="bg-layer" ref="layer"></div>
    <!--可滚动列表-->
    <scroll
      :data="songs"
      :listen-scroll="listenScroll"
      :probe-type="probeType"
      @scroll="scroll"
      class="list"
      ref="scroll"
    >
      <div class="song-list-wrapper">
        <song-list @select="selectItem" :songs="songs" :rank="rank"></song-list>
      </div>
      <div v-if="!songs || !songs.length" class="loading-wrapper">
        <loading></loading>
      </div>
    </scroll>
  </div>
</template>

<script>
    import Scroll from '@baseComps/scroll/scroll';
    import Loading from '@baseComps/loading/loading';
    import SongList from '@baseComps/song-list/song-list';
    import { mapActions } from 'vuex';

    // js增加css3前缀
    import { prefix } from '@common/js/dom';
    // mixins，一些通用地方
    import { playListMixin } from '@common/js/mixin';

    const transform = prefix('transform');
    const backdrop = prefix('backdrop-filter');

    export default {
      name: 'music-list',
      mixins: [playListMixin],
      props: {
        bgImage: {
          type: String,
          default: '',
        },
        songs: {
          type: Array,
          default: () => [],
        },
        title: {
          type: String,
          default: '',
        },
        rank: {
          type: Boolean,
          default: false,
        },
      },
      data() {
        return {
          scrollY: 0,
          imageHeight: 0,
          toHeight: 80,
        };
      },
      computed: {
        bgStyle() {
          return `background-image: url(${this.bgImage})`;
        },
      },
      created() {
        // 实施检测滚动
        this.probeType = 3;
        this.listenScroll = true;
      },
      mounted() {
        // 图片高度
        this.imageHeight = this.$refs.bgImage.clientHeight;
      },
      methods: {
        // 处理当有音乐播放时候，滚动栏距离底部的高度为 mini-player的高度
        handlePlaylist(playList) {
          const bottom = playList.length > 0 ? `${this.miniHeight}px` : '';
          this.$refs.scroll.$el.style.bottom = bottom;
        },
        // 滚动事件
        scroll(pos) {
          this.scrollY = pos.y;
        },
        // 返回上一页
        back() {
          this.$router.back();
        },
        // 选中当前歌曲
        selectItem(item, index) {
          this.selectPlay({
            list: this.songs,
            index,
          });
        },
        // 随机播放
        randomPlaying() {
          this.randomPlay({
            list: this.songs,
          });
        },
        ...mapActions([
          'selectPlay',
          'randomPlay',
        ]),
      },
      watch: {
        // 动态计算滚动列表距离顶部的高度，750px宽度下是160px, 375px下应该是 40px;
        // 750宽度设计下525高度中 是160px，
        imageHeight(newVal) {
          const percent = 160 / 525;
          // 距离顶部高度
          this.toHeight = newVal * percent;
          // 最大滚动高度
          this.minTranslateY = -this.imageHeight + this.toHeight;
        },
        // 检测滚动变化
        scrollY(newVal) {
          const translateY = Math.max(this.minTranslateY, newVal);
          let zIndex = 0;
          // 缩放
          let scale = 1;
          let blur = 0;
          // 移动的百分比
          const percent = Math.abs(newVal / this.imageHeight);
          // 上拉的时候才放大
          if(newVal > 0) {
            scale += percent;
          } else {
            // 高斯模糊，ios才有效
            blur = Math.min(20, percent * 20);
          }
          // 层被顶上去
          this.$refs.layer.style[transform] = `translate3d(0, ${translateY}px, 0)`;
          // 高斯模糊，ios才有效
          this.$refs.filter.style[backdrop] = `blur(${blur}px)`;
          // 超出时候，图片显示出来（不被滚动栏覆盖）
          if(newVal < this.minTranslateY) {
            zIndex = 10;
            this.$refs.avatar.style.height = `${this.toHeight}px`;
            this.$refs.avatar.style.zIndex = zIndex;
            this.$refs.playBtn.style.display = 'none';
          } else {
            this.$refs.avatar.style.height = '';
            this.$refs.avatar.style.zIndex = '';
            this.$refs.playBtn.style.display = '';
          }
          this.$refs.bgImage.style[transform] = `scale(${scale})`;
        },
      },
      components: {
        Scroll,
        SongList,
        Loading,
      },
    };
</script>

<style lang="scss" scoped>
  .music-list {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: $color-background;
    .avatar {
      position: relative;
      overflow: hidden;
      .back {
        position: absolute;
        top: 0;
        left: 12px;
        .icon-back {
          display: block;
          padding: 20px;
          font-size: $font-size-large-x;
          color: $color-theme;
        }
        // 因为滚动时候会被bg的scale(1)覆盖
        z-index: 1;
      }
      .title {
        position: absolute;
        width: 80%;
        left: 50%;
        transform: translateX(-50%);
        line-height: 80px;
        text-align: center;
        font-size: $font-size-large;
        color: $color-text;
        // 因为滚动时候会被bg的scale(1)覆盖
        z-index: 1;
      }
      .bg-image {
        // 宽度的70%
        height: 525px;
        // 从上开始
        transform-origin: top;
        background-size: cover;
        // 遮罩层
        .filter {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          right: 0;
          background-color: rgba(7, 17, 27, 0.4);
        }
      }
      .play-wrapper {
        position: absolute;
        bottom: 40px;
        width: 100%;
        .play {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 270px;
          padding: 14px 0;
          margin: 0 auto;
          text-align: center;
          @include _1px('all', $color-theme, 200px);
          color: $color-theme;
          .icon-play {
            margin-right: 12px;
            font-size: $font-size-medium-x
          }
          .text {
            font-size: $font-size-small;
          }
        }
      }
    }
    // 滚动列表滚动时候，被推上去，盖住背景图
    .bg-layer {
      position: relative;
      z-index: 2;
      height: 100%;
      background: $color-background;
    }
    .list {
      position: fixed;
      z-index: 2;
      width: 100%;
      // 占70%
      top: 525px;
      bottom: 0;
      background: $color-background;
      // 滚动出去的内容显示出来
      overflow: visible;
      .song-list-wrapper {
        padding: 40px 60px;
      }
      .loading-wrapper {
        position: absolute;
        width: 100%;
        top: 50%;
        transform: translateY(-50%);
      }
    }
  }
</style>
