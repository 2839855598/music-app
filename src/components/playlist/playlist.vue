<template>
  <!--播放列表组件-->
  <transition name="list-fade">
    <div class="playlist" v-show="showFlag" @click="hide">
      <div class="list-wrapper" @click.stop>
        <!--头部 有切换模式 和 清除按钮-->
        <div class="list-header">
          <h1 class="title">
            <i class="icon" :class="iconMode" @click="changeMode"></i>
            <span class="text">{{modeText}}</span>
            <span class="clear" @click="showConfirm"><i class="icon-clear"></i></span>
          </h1>
        </div>
        <!-- 播放列表内容 -->
        <scroll
          :data="sequenceList"
          :refreshDelay="refreshDelay"
          class="list-content"
          ref="listContent"
        >
          <transition-group name="list" tag="ul">
            <li class="item"
                @click="selectItem(item, index)"
                v-for="(item, index) in sequenceList"
                :key="item.id"
                ref="listItem"
            >
              <i class="current" :class="getCurrentIcon(item)"></i>
              <span class="text">{{item.name}}</span>
              <span class="like" @click.stop="toggleFavorite(item)">
                <i :class="getFavoriteIcon(item)"></i>
              </span>
              <span class="delete" @click.stop="deleteOne(item)">
                <i class="icon-delete"></i>
              </span>
            </li>
          </transition-group>
        </scroll>
        <!--添加歌曲到队列 按钮-->
        <div class="list-operate">
          <div class="add" @click="showAddSong">
            <i class="icon-add"></i>
            <span class="text">添加歌曲到队列</span>
          </div>
        </div>
        <!--关闭播放列表 按钮-->
        <div class="list-close" @click="hide">
          <span>关闭</span>
        </div>
      </div>
      <confirm ref="confirm" @confirm="confirmClear" text="是否清空列表" confirmBtnText="清空">
      </confirm>
      <add-song ref="addSong"></add-song>
    </div>
  </transition>
</template>

<script>
    import { mapActions } from 'vuex';
    import playMode from '@common/js/config';
    import Confirm from '@baseComps/confirm/confirm';
    import Scroll from '@baseComps/scroll/scroll';
    // 添加歌曲页面
    import AddSong from '@components/add-song/add-song';
    // player 和 playerlist 共用
    import { playMixin } from '@common/js/mixin';

    export default {
      name: 'playlist',
      mixins: [playMixin],
      data() {
        return {
          showFlag: false,
          refreshDelay: 100,
        };
      },
      computed: {
        modeText() {
          return this.mode === playMode.sequence ? '顺序播放'
            : this.mode === playMode.random ? '随机播放' : '单曲循环';
        },
      },
      methods: {
        // 可供外部调用
        show() {
          this.showFlag = true;
          setTimeout(() => {
            this.$refs.listContent.refresh();
            // 滚动到当前歌曲
            this.scrollToCurrent(this.currentSong);
          }, 20);
        },
        // 内部调用
        hide() {
          this.showFlag = false;
        },
        // 当前歌曲前面有 icon标志
        getCurrentIcon(item) {
          if(item.id === this.currentSong.id) {
            return 'icon-play';
          }
          return '';
        },
        // 选择歌曲
        selectItem(item, index) {
          // 当前模式是随机模式
          if(this.mode === playMode.random) {
             index = this.playList.findIndex(song => song.id === item.id);
          }
          this.setCurrentIndex(index);
          this.setPlayingState(true);
        },
        // 滚动到当前歌曲
        scrollToCurrent(current) {
          // 当前展示的列表的索引
          const index = this.sequenceList.findIndex(song => song.id === current.id);
          this.$refs.listContent.scrollToElement(this.$refs.listItem[index], 300);
        },
        // 删除一首歌曲
        deleteOne(item) {
          this.deleteSong(item);
          // 删完后就隐藏掉
          if(!this.playList.length) {
            this.hide();
          }
        },
        // 显示confirm
        showConfirm() {
          this.$refs.confirm.show();
        },
        // 确定清除歌曲列表
        confirmClear() {
          this.clearSongList();
          this.hide();
        },
        // 显示 增加歌曲页面
        showAddSong() {
          this.$refs.addSong.show();
        },
        ...mapActions([
          // 删除一首歌曲
          'deleteSong',
          // 清空播放列表
          'clearSongList',
        ]),
      },
      watch: {
        currentSong(newSong, oldSong) {
          if(!this.showFlag || newSong === oldSong) {
            return;
          }
          // 滚动到当前歌曲
          this.scrollToCurrent(newSong);
        },
      },
      components: {
        Scroll,
        Confirm,
        AddSong,
      },
    };
</script>

<style lang="scss" scoped>
  .playlist {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    /*目前是最高级，添加歌曲后也是最高等级*/
    z-index: 11;
    background: $color-background-d;
    &.list-fade-enter-active, &.list-fade-leav-active {
      transition: opacity 0.3s;
      .list-wrapper {
        transition: all 0.3s;
      }
    }
    &.list-fade-enter, &.list-fade-leave-to {
      opacity: 0;
      .list-wrapper {
        transform: translate3d(0, 100%, 0);
      }
    }
    .list-wrapper {
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      background-color: $color-highlight-background;
      .list-header {
        position: relative;
        padding: 40px 60px 20px;
        .title {
          display: flex;
          align-items: center;
          .icon {
            margin-right: 20px;
            font-size: 60px;
            color: $color-theme-d;
          }
          .text {
            flex: 1;
            font-size: $font-size-medium;
            color: $color-text-l;
          }
          .clear {
            .icon-clear {
              font-size: $font-size-medium;
              color: $color-text-d;
            }
          }
        }
      }
      .list-content {
        max-height: 480px;
        overflow: hidden;
        .item {
          display: flex;
          align-items: center;
          height: 80px;
          padding: 0 60px 0 40px;
          overflow: hidden;
          // 删除歌曲时候，高度变为0
          &.list-enter-active, &.list-leave-active {
            transition: all 0.1s;
          }
          &.list-enter, &.list-leave-to {
            height: 0;
          }
          .current {
            flex: 0 0 40px;
            width: 40px;
            font-size: $font-size-small;
            color: $color-theme-d;
          }
          .text {
            flex: 1;
            @include no-wrap();
            font-size: $font-size-medium;
            color: $color-text-d;
          }
          .like {
            margin-right: 30px;
            font-size: $font-size-small;
            color: $color-theme;
            .icon-favorite {
              color: $color-sub-theme;
            }
          }
          .delete {
            font-size: $font-size-small;
            color: $color-theme;
          }
        }
      }
      .list-operate {
        width: 280px;
        margin: 40px auto 60px auto;
        .add {
          display: flex;
          align-items: center;
          padding: 16px 32px;
          border: 2px solid $color-text-l;
          border-radius: 200px;
          color: $color-text-l;
          .icon-add {
            margin-right: 10px;
            font-size: $font-size-small-s;
          }
          .text {
            flex: 1;
            font-size: $font-size-small;
          }
        }
      }
      .list-close {
        text-align: center;
        line-height: 100px;
        background-color: $color-background;
        font-size: $font-size-medium-x;
        color: $color-text-l;
      }
    }
  }
</style>
