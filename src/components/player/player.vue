<template>
  <div class="player" v-show="playList && playList.length">
    <transition
      name="normal"
      @enter="enter"
      @after-enter="afterEnter"
      @leave="leave"
      @after-leave="afterLeave"
    >
      <div class="normal-player" v-show="fullScreen">
        <!--模糊层-->
        <div class="background">
          <img alt="图片" :src="currentSong.image">
        </div>
        <!--头部-->
        <div class="top">
          <div class="back" @click="back">
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html="currentSong.name"></h1>
          <h2 class="subtitle" v-html="currentSong.singer"></h2>
        </div>
        <!--中间-->
        <div class="middle"
             @touchstart.prevent="middleTouchStart"
             @touchmove.prevent="middleTouchMove"
             @touchend="middleTouchEnd"
        >
          <!--中间cd图片旋转-->
          <div class="middle-l" ref="middleL">
            <!--cd图片旋转-->
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd"  ref="cd" >
                <img :src="currentSong.image" :class="cdState" ref="cdImg"  class="image">
                <div class="wang"></div>
              </div>
            </div>
            <!--一行歌词-->
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{playingLyric}}</div>
            </div>
          </div>
          <!--中间歌词部分-->
          <scroll class="middle-r" ref="lyricList"
                  :data="currentLyric && currentLyric.lines"
          >
            <div class="lyric-wrapper">
              <div v-if="currentLyric" class="currentLyric">
                <p
                  v-for="(line, index) in currentLyric.lines"
                  :key="index"
                  class="text"
                  :class="{'current': index === currentLineNum}"
                  ref="lyricLine" >
                  {{line.txt}}
                </p>
              </div>
            </div>
          </scroll>
        </div>
        <!--底部-->
        <div class="bottom">
          <!--点-->
          <div class="dot-wrapper">
            <span class="dot" :class="{'active': currentShow === 'cd'}"></span>
            <span class="dot" :class="{'active': currentShow === 'lyric'}"></span>
          </div>
          <!--滚动进度条部分-->
          <div class="progress-wrapper">
            <!--当前时间-->
            <span class="time currentTime">{{formatTime(currentTime)}}</span>
            <!--进度条-->
            <div class="progress-bar-wrapper">
              <progress-bar @percentChange="progressBarChange"
                            :percent="percent"
                            ref="progressBar">
              </progress-bar>
            </div>
            <!--总时间-->
            <span class="time totalTime">{{formatTime(currentSong.duration)}}</span>
          </div>
          <!--操作面板(上一首，暂停等)-->
          <div class="operators">
            <div @click="changeMode" class="icon i-left">
              <i :class="iconMode"></i>
            </div>
            <div class="icon i-left" :class="disableCls">
              <i @click.stop="prev" class="icon-prev"></i>
            </div>
            <div class="icon i-center" :class="disableCls">
              <i @click.stop="togglePlaying" :class="playIcon"></i>
            </div>
            <div class="icon i-right" :class="disableCls">
              <i @click.stop="next" class="icon-next"></i>
            </div>
            <div class="icon i-right">
              <i class="icon"
                 @click="toggleFavorite(currentSong)"
                 :class="getFavoriteIcon(currentSong)"
              >
              </i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <transition name="mini">
      <div @click="open" class="mini-player" v-show="!fullScreen">
        <div class="icon">
          <img :src="currentSong.image" :class="cdState">
        </div>
        <div class="text">
          <h2 class="name" v-html="currentSong.name"></h2>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>
        <div class="control">
          <progress-circle :radius="radius" :percent="percent">
            <i @click.stop="togglePlaying" class="icon-mini" :class="miniIcon"></i>
          </progress-circle>
        </div>
        <div class="control" @click.stop="showPlayList">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <!--播放列表-->
    <play-list ref="playlist"></play-list>
    <!--播放源-->
    <audio
      :src="currentSong.url"
      @canplay="ready"
      @error="error"
      @ended="end"
      @timeupdate="updateTime"
      ref="audio"
    ></audio>
  </div>
</template>

<script>
    import { mapState, mapMutations, mapActions } from 'vuex';
    import Scroll from '@baseComps/scroll/scroll';
    // 播放列表
    import PlayList from '@components/playlist/playlist';
    // 正常进度条
    import progressBar from '@baseComps/progress-bar/progress-bar';
    // 圆形进度条
    import progressCircle from '@baseComps/progress-circle/progress-circle';
    // 播放模式
    import playMode from '@common/js/config';
    // 处理歌词
    import Lyric from 'lyric-parser';
    // 动画
    import animations from 'create-keyframe-animation';
    import { prefix } from '@common/js/dom';
    // player 和 playerlist 共用
    import { playMixin } from '@common/js/mixin';

    const transform = prefix('transform');
    const prefixAnimation = prefix('animation');
    const transitionDuration = prefix('transitionDuration');

    export default {
      name: 'player',
      mixins: [playMixin],
      data() {
        return {
          songReady: false,
          currentTime: 0,
          radius: 32,
          currentLyric: null,
          currentLineNum: 0,
          currentShow: 'cd',
          playingLyric: '',
          isGetLyric: false,
        };
      },
      computed: {
        // cd图片的状态
        cdState() {
          return this.playing ? 'play' : 'pause';
        },
        // 大图样式图标由播放状态决定
        playIcon() {
          return this.playing ? 'icon-pause' : 'icon-play';
        },
        // 小图样式图标由播放状态决定
        miniIcon() {
          return this.playing ? 'icon-pause-mini' : 'icon-play-mini';
        },
        // 禁止样式（歌曲却没加载好）
        disableCls() {
          return this.songReady && this.isGetLyric ? '' : 'disable';
        },
        // 时间所占百分比，利于进度条的实现
        percent() {
          return this.currentTime / this.currentSong.duration;
        },
        ...mapState([
          'fullScreen',
          'playing',
          'currentIndex',
        ]),
      },
      created() {
        this.touch = {};
      },
      methods: {
        getStyle(ele, attr) {
          return window.getComputedStyle(ele)[attr];
        },
        // 缩小状态
        back() {
          this.setFullScreen(false);
        },
        // 全屏状态
        open() {
          this.setFullScreen(true);
        },
        // 下一首歌
        next() {
          // 百分比归零，进度条里面归0
          this.$refs.progressBar.initWidth();
          this.currentTime = 0;

          // 没加载好歌曲，不能点击
          if(!this.songReady) {
            return;
          }
          // 如果只有一首歌，循环就行
          if(this.playList.length === 1) {
            this.loop();
            return;
          }
          // 如果只有一首歌，不加上面的逻辑，一直next，一直index === this.playList.length,
          // 一直index = 0;
          let index = this.currentIndex + 1;
          if(index === this.playList.length) {
            index = 0;
          }
          this.setCurrentIndex(index);
          // 暂停时候切换歌曲，需要改变状态
          if(!this.playing) {
            this.togglePlaying();
          }
          // 重置下一首歌加载的状态
          this.songReady = false;
        },
        // 上一首歌
        prev() {
          // 百分比归零，进度条立马归0
          this.$refs.progressBar.initWidth();
          this.currentTime = 0;

          // 没加载好歌曲，不能点击
          if(!this.songReady) {
            return;
          }
          // 如果只有一首歌，循环就行
          if(this.playList.length === 1) {
            this.loop();
            return;
          }
          // 如果只有一首歌，不加上面的逻辑，一直next，一直index === this.playList.length,
          // 一直index = 0;
          let index = this.currentIndex - 1;
          if(index === -1) {
            index = this.playList.length - 1;
          }
          this.setCurrentIndex(index);
          // 暂停时候切换歌曲，需要改变为播放状态
          if(!this.playing) {
            this.togglePlaying();
          }
          // 重置下一首歌加载的状态
          this.songReady = false;
        },
        // 歌曲加载好才能点击下一首，上一首，避免过快点击导致错误
        ready() {
          this.songReady = true;
          // 添加到最近播放历史
          this.savePlayHistory(this.currentSong);
        },
        // 防止歌曲出错无法正常点击上一首，下一首歌
        error() {
          this.songReady = true;
        },
        // 结束时候
        end() {
          // 单曲模式
          if(this.mode === playMode.loop) {
            this.loop();
          } else {
            this.next();
          }
        },
        // 单曲播放
        loop() {
          // currentTime可以读写
          // 重置为0
          this.$refs.audio.currentTime = 0;
          this.$refs.audio.play();
          this.setPlayingState(true);
          // 单曲循环时候，歌词要设置在最开头
          if(this.currentLyric) {
            this.currentLyric.seek(0);
          }
        },
        // 切换 开始 暂停
        togglePlaying() {
          // 歌曲没加载好时候，点击播放暂停没用
          if(!this.songReady) {
            return;
          }
          // 没有歌词的话，无法点击
          if(!this.isGetLyric) {
            return;
          }
          this.setPlayingState(!this.playing);
          // 切换播放暂停时候，歌词也跟着切换播放暂停,否则，歌曲暂停了，歌词还在跳动
          if(this.currentLyric) {
            this.currentLyric.togglePlay();
          }
        },
        // 实时监测radio播放时间
        updateTime(e) {
          // 以s为单位的时间戳
          this.currentTime = e.target.currentTime;
        },
        // 修正拖动时候改变的进度条的百分比
        progressBarChange(percent) {
          const currentTime = this.currentSong.duration * percent;
          // audio.currentTime是个可 读写的属性
          this.$refs.audio.currentTime = currentTime;
          // 如果暂停状态，那就播放
          if(!this.playing) {
            this.togglePlaying();
          }
          // 歌词也移动到相应位置
          if(this.currentLyric) {
            this.currentLyric.seek(currentTime * 1000);
          }
        },
        // 格式化时间
        formatTime(interval) {
          const minutes = this._padding0(Math.floor(interval / 60));
          const seconds = this._padding0(Math.floor(interval % 60));
          return `${minutes}:${seconds}`;
        },
        // 时间补0
        _padding0(m, n = 2) {
          let { length } = m.toString();
          while(length < n) {
            m = '0' + m;
            length++;
          }
          return m;
        },
        // 获取歌词
        getLyric() {
          this.currentSong.getSongLyric()
            .then((lyric) => {
              this.currentLyric = new Lyric(lyric, this.handleLyric);
              // 歌曲播放时候，歌曲开始启动
              if(this.playing) {
                this.currentLyric.play();
              }
              this.isGetLyric = true;
            }).catch(() => {
              this.currentLyric = null;
              this.playingLyric = '';
              this.currentLineNum = 0;
          });
        },
        // 处理歌词每一行的函数
        handleLyric({ lineNum, txt }) {
          this.currentLineNum = lineNum;
          // 大于5行时候滚动， 到7行时候向上滚动2行，始终让其在中间
          if(lineNum > 5) {
            const lineEle = this.$refs.lyricLine[lineNum - 5];
            this.$refs.lyricList.scrollToElement(lineEle, 1000);
          } else {
            // 不是scrollToElement
            this.$refs.lyricList.scrollTo(0, 0, 1000);
          }
          // 一行歌词
          this.playingLyric = txt;
        },
        // 滑动歌词
        middleTouchStart(e) {
          // 第一个手指
          const touches = e.touches[0];
          this.touch.init = true;
          this.touch.startX = touches.pageX;
          // 为什么要y，因为歌词部分是纵向滚动，当纵向滚动大于横向滚动，横向就没法滚动
          this.touch.startY = touches.pageY;
        },
        middleTouchMove(e) {
          if(!this.touch.init) {
            return;
          }
          const touches = e.touches[0];
          const deltaX = touches.pageX - this.touch.startX;
          const deltaY = touches.pageY - this.touch.startY;
          // 纵向滚动大于横向滚动，就是默认纵向滚动，横向不能滚动了
          if(Math.abs(deltaY) > Math.abs(deltaX)) {
            return;
          }
          // 滑动时候要分当cd页 还是 歌词页，滑动的具体对象是歌词页
          // 当前cd页，歌词页初始位置为0,向左滑动最大为-window.innerWidth,
          // 向右滑动最大距离为0(没动)
          // 当前为歌词页时候，歌词页初始位置为-window.innerWidth, 向左滑动最大距离还是
          // -window.innerWidth(没动)，向右滑动最大距离为0
          const left = this.currentShow === 'cd' ? 0 : -window.innerWidth;
          // 滑动的偏移
          const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX));
          // 滑动的距离所占视口宽度的百分比
          this.touch.percent = Math.abs(offsetWidth / window.innerWidth);
          // 因为是组件，获取dom要加上$el
          this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`;
          this.$refs.lyricList.$el.style[transitionDuration] = 0;
          // 歌词滑动的距离越大，cd页的透明度越低
          this.$refs.middleL.style.opacity = 1 - this.touch.percent;
          this.$refs.middleL.style[transitionDuration] = 0;
        },
        middleTouchEnd() {
          let offsetWidth;
          let opacity;

          // 当前cd页面
          if(this.currentShow === 'cd') {
            // 滑动距离超过可视屏幕宽度的百分10，歌词页面不是100%宽度，80%宽度
            // 所以向左移动20%，才是当前屏幕的百分10
            if(this.touch.percent > 0.2) {
              offsetWidth = -window.innerWidth;
              // cd页面透明度
              opacity = 0;
              this.currentShow = 'lyric';
              // 滑动距离没超过百分10，回到原来位置
            } else {
              offsetWidth = 0;
              // cd页面透明度
              opacity = 1;
            }
          // 当前是歌词页面
          } else {
            // 意思就是歌词页面向右滑动大于10%(向左滑动小于百分90)
            // 歌词页面回到最初的 最右边位置
            if(this.touch.percent < 0.8) {
              offsetWidth = 0;
              this.currentShow = 'cd';
              // cd页的透明度
              opacity = 1;
            } else {
              offsetWidth = -window.innerWidth;
              // cd页的透明度
              opacity = 0;
            }
          }
          const time = 300;
          this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`;
          this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`;
          // 歌词页透明度
          this.$refs.middleL.style.opacity = opacity;
          this.touch.init = false;
        },
        // 获取大图到小图之间的x,y偏移
        _getPosAdnScale() {
          // 小图地方
          const targetWidth = 40;
          // 小图半宽度+ 左边padding
          const paddingLeft = 40;
          // 小图半宽度+ 左边padding
          const paddingBottom = 30;
          const paddingTop = 80;
          // 大图高度
          const width = window.innerWidth * 0.8;
          const scale = targetWidth / width;
          //  目标x(小图中心) - 当前x(大图中心)
          const x = paddingLeft - window.innerWidth / 2;
          //  目标y(小图中心) - 当前y(大图中心)
          const y = window.innerHeight - paddingTop - width / 2 - paddingBottom;
          return {
            x,
            y,
            scale,
          };
        },
        enter(el, done) {
          // 入场动画，从none => block
          const { x, y, scale } = this._getPosAdnScale();

          const animation = {
            0: {
              transform: `translate3d(${x}px,${y}px,0) scale(${scale})`,
            },
            60: {
              transform: 'translate3d(0,0,0) scale(1.1)',
            },
            100: {
              transform: 'translate3d(0,0,0) scale(1)',
            },
          };

          animations.registerAnimation({
            name: 'move',
            animation,
            presets: {
              duration: 400,
              easing: 'linear',
            },
          });

          // 动画作用在哪个dom上
          animations.runAnimation(this.$refs.cdWrapper, 'move', done);
        },
        afterEnter() {
          // 重置
          animations.unregisterAnimation('move');
          this.$refs.cdWrapper.style[prefixAnimation] = '';
        },
        leave(el, done) {
          // 离开动画，从block => none
          this.$refs.cdWrapper.style.transition = 'all 0.4s';
          const { x, y, scale } = this._getPosAdnScale();
          this.$refs.cdWrapper.style[transform] = `translate3d(${x}px,${y}px,0) scale(${scale})`;
          this.$refs.cdWrapper.addEventListener('transitionend', done);
        },
        afterLeave() {
          // 重置
          this.$refs.cdWrapper.style.transition = '';
          this.$refs.cdWrapper.style[transform] = '';
        },
        // 显示播放列表
        showPlayList() {
          this.$refs.playlist.show();
        },
        ...mapMutations({
          setFullScreen: 'SET_FULL_SCREEN',
        }),
        ...mapActions({
          savePlayHistory: 'savePlayHistory',
        }),
      },
      watch: {
        // 当前歌曲改变
        currentSong(newSong, oldSong) {
          // 删除playlist表中最后一个数据时候，产生了currentSong变化，导致触发了
          // 获取歌词事件this.getLyric()，报错了
          if(!newSong.id) {
            return;
          }
          // 切换模式时候，会重置索引，导致currentSong变化并执行，
          // 当是同一首歌时候，不做改变。
          if(newSong.id === oldSong.id) {
            return;
          }
          // 因为歌词里面有定时器
          // 所以切换时候，上个定时器没关闭，就会对当前歌曲造成闪烁影响
          if(this.currentLyric) {
            // 关闭当前歌词定时器
            this.currentLyric.stop();
            // 重置
            this.currentTime = 0;
            this.playingLyric = '';
            this.currentLineNum = 0;
          }
          this.isGetLyric = false;
          this.$nextTick(() => {
            this.$refs.audio.play();
            this.getLyric();
          });
        },
        // 当前状态变化
        playing(newState) {
          // 暂停时候，保持当前图片旋转角度，这里有bug，没实现好
           if(!newState) {
            //
            const cdImage = document.getElementsByClassName('image')[0];
            const currentTransform = this.getStyle(cdImage, transform);
            const cd = document.getElementsByClassName('cd')[0];
            cd.style[transform] = currentTransform;
          }
          const { audio } = this.$refs;
          // 因为第一次点击时候，改变了playing,为true，立即执行watch，
          this.$nextTick(() => {
            newState ? audio.play() : audio.pause();
          });
        },
        // 检测全屏状态
        fullScreen(newVal) {
          // 防止切换时候，歌词可滚动距离计算错误
          if(newVal) {
            setTimeout(() => {
              this.$refs.lyricList.refresh();
            }, 20);
          }
        },
      },
      components: {
        progressBar,
        progressCircle,
        Scroll,
        PlayList,
      },
    };
</script>

<style lang="scss" scoped>
  .player {
    .normal-player {
      position: fixed;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      z-index: 10;
      background: $color-background;
      .background {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        z-index: -1;
        opacity: 0.6;
        filter: blur(20px);
        img {
          width: 100%;
          height: 100%;
        }
      }
      .top {
        margin-bottom: 50px;
        .back {
          position: absolute;
          margin-left: 12px;
          .icon-back {
            display: block;
            padding: 18px;
            font-size: $font-size-large-x;
            color: $color-theme;
            transform: rotate(-90deg);
          }
        }
        .title {
          width: 70%;
          margin: 0 auto;
          line-height: 80px;
          text-align: center;
          @include no-wrap();
          font-size:  $font-size-large;
          color: $color-text;
        }
        .subtitle {
          line-height: 40px;
          text-align: center;
          font-size: $font-size-medium;
          color: $color-text;
        }
      }
      .middle {
        position: absolute;
        width: 100%;
        top: 160px;
        bottom: 340px;
        white-space: nowrap;
        .middle-l {
          display: inline-block;
          vertical-align: top;
          position: relative;
          width: 100%;
          height: 0;
          padding-top: 80%;
          .cd-wrapper {
            position: absolute;
            left: 10%;
            top: 0;
            width: 80%;
            height: 100%;
            .cd {
              width: 100%;
              height: 100%;
              box-sizing: border-box;
              border: 10px solid rgba(255, 255, 255, 0.1);
              border-radius: 50%;
              .image {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                border-radius: 50%;
                &.play {
                  animation: rotate 20s linear infinite;
                }
              }
            }
          }
          .playing-lyric-wrapper {
            width: 80%;
            margin: 60px auto 0 auto;
            overflow: hidden;
            text-align: center;
            .playing-lyric {
              line-height: 40px;
              font-size: $font-size-medium;
              color: $color-text-l;
            }
          }
        }
        .middle-r {
          display: inline-block;
          vertical-align: top;
          width: 100%;
          height: 100%;
          overflow: hidden;
          .lyric-wrapper {
            width: 80%;
            margin: 0 auto;
            overflow: hidden;
            text-align: center;
            .text {
              line-height: 64px;
              color: $color-text-l;
              font-size: $font-size-medium;
              &.current {
                color: $color-text;
              }
            }
          }
        }
      }
      .bottom {
        position: absolute;
        bottom: 100px;
        width: 100%;
        // 点
        .dot-wrapper {
          text-align: center;
          font-size: 0;
          .dot {
            display: inline-block;
            vertical-align: middle;
            margin: 0 8px;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: $color-text-l;
            &.active {
              width: 40px;
              border-radius: 10px;
              background-color: $color-text-ll;
            }
          }
        }
        // 进度条
        .progress-wrapper {
          display: flex;
          align-items: center;
          width: 80%;
          margin: 0 auto;
          padding: 20px;
          .time {
            color: $color-text;
            font-size: $font-size-small;
            flex: 0 0 60px;
            &.currentTime {
              text-align: left;
            }
            &.totalTime {
              text-align: right;
            }
          }
          .progress-bar-wrapper{
            flex: 1;
            margin: 0 20px;
          }
        }
        // 操作面板
        .operators {
          display: flex;
          align-items: center;
          .icon {
            flex: 1;
            color: $color-theme;
            &.disable {
              color: $color-theme-d;
            }
            i {
              font-size: 60px;
            }
          }
          .i-left {
            text-align: right;
          }
          .i-center {
            padding: 0 40px;
            text-align: center;
            i {
              font-size: 80px;
            }
          }
          .i-right {
            text-align: left;
          }
        }
      }
      // 整体动画
      &.normal-enter-active, &.normal-leave-active {
        transition: all 0.4s;
        // top, bottom有个回弹的动画
        .top, .bottom {
          transition: all 0.4s cubic-bezier(.27, .55, .6, 1.29);
        }
      }
      &.normal-enter, &.normal-leave-to {
        opacity: 0;
        // 初始位置，顶部从上往下运动。底部从下往上运动
        .top {
          transform: translate3d(0, -100px, 0);
        }
        .bottom {
          transform: translate3d(0, 100px, 0);
        }
      }
    }
    .mini-player {
      display: flex;
      align-items: center;
      position: fixed;
      left: 0;
      bottom: 0;
      z-index: 10;
      width: 100%;
      height: 120px;
      background: $color-highlight-background;
      .icon {
        flex: 0 0 80px;
        width: 80px;
        padding: 0 20px 0 40px;
        img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          &.play {
            animation: rotate 10s linear infinite;
          }
          &.pause {
            animation-play-state: paused;
            animation-fill-mode: forwards;
          }
        }
      }
      .text {
        display: flex;
        flex-direction: column;
        justify-content: center;
        flex: 1;
        line-height: 40px;
        overflow: hidden;
        .name {
          margin-bottom: 4px;
          @include no-wrap();
          font-size: $font-size-medium;
          color: $color-text;
        }
        .desc {
          @include no-wrap();
          font-size: $font-size-small;
        }
      }
      .control {
        flex: 0 0 60px;
        width: 60px;
        padding: 0 20px;
        .icon-play-mini, .icon-pause-mini, .icon-playlist {
          font-size: 60px;
          color: $color-theme-d;
        }
        // 相对于圆形进度条定位的，把这个icon放在圆形进度条里面
        .icon-mini {
          font-size: 64px;
          position: absolute;
          left: 0;
          top: 0;
        }
      }
      &.mini-enter-active, &.mini-leave-active {
        transition: opacity 0.4s;
      }
      &.mini-enter, &.mini-leave-to {
        opacity: 0;
      }
    }
  }
  @keyframes rotate {
    0% {
      transform: rotate(0);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
