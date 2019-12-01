<template>
  <!--排行榜-->
  <div class="rank" ref="rank">
    <scroll :data="topList" class="toplist" ref="toplist">
      <ul>
        <li @click="selectItem(item)" class="item" v-for="(item, index) in topList" :key="index" >
          <!--左侧列表-->
          <ul class="songlist">
            <h2 class="title">{{item.title}}</h2>
            <li class="song" v-for="(song, index) in item.song" :key="index">
              <span>{{index + 1}}.</span>
              <span>{{song.title}}-{{song.singerName}}</span>
            </li>
          </ul>
          <!--右侧图片-->
          <div class="icon">
            <img v-lazy="item.mbHeadPicUrl" >
          </div>
        </li>
      </ul>
      <div class="loading-container" v-show="!topList.length">
        <loading></loading>
      </div>
    </scroll>
    <!--排行榜详情页出口-->
    <transition name="slide">
      <router-view></router-view>
    </transition>
  </div>
</template>

<script>
    import Scroll from '@baseComps/scroll/scroll';
    // mixins，一些通用地方
    import { playListMixin } from '@common/js/mixin';
    // 加载图
    import Loading from '@baseComps/loading/loading';
    import { mapMutations } from 'vuex';

    const ERROR_OK = 0;

    export default {
      name: 'rank',
      mixins: [playListMixin],
      data() {
        return {
          topList: [],
        };
      },
      created() {
        // 获取排行榜数据
        this._getRank();
      },
      methods: {
        // 处理当有音乐播放时候，滚动栏距离底部的高度为 mini-player的高度
        handlePlaylist(playList) {
          const bottom = playList.length > 0 ? `${this.miniHeight}px` : '';
           this.$refs.rank.style.marginBottom = bottom;
          // 刷新滚动栏
          this.$refs.toplist.refresh();
        },
        // 获取排行榜数据
        _getRank() {
          this.$api.music.getRank()
            .then(({ data: { code, topList: { data: { group } } } }) => {
              if(ERROR_OK === code) {
                // normal里面没ajax请求，可以使用这种赋值方式
                this.topList = this._normalizeRank(group);
              }
          });
        },
        _normalizeRank(group) {
          const ret = [];
          group.forEach((item) => {
            const { toplist } = item;
            if(toplist && toplist.length) {
               ret.push(...toplist);
            }
          });
          return ret;
        },
        // 选择排行榜详情
        selectItem(item) {
          this.$router.push({
            path: `/rank/${item.topId}`,
          });
          this.setTopList(item);
        },
        ...mapMutations({
          setTopList: 'SET_TOP_LIST',
        }),
      },
      components: {
        Scroll,
        Loading,
      },
    };
</script>

<style lang="scss" scoped>
  .rank {
    flex: 1;
    overflow: hidden;
    position: relative;
    .toplist {
      height: 100%;
      .item {
        display: flex;
        padding: 40px 40px 0;
        &.last-child {
          padding-bottom: 40px;
        }
        // 左侧列表
        .songlist {
          flex: 1;
          display: flex;
          height: 200px;
          flex-direction: column;
          justify-content: center;
          padding: 0 40px;
          overflow: hidden;
          background: $color-highlight-background;
          color: $color-text-d;
          font-size: $font-size-small;
          .title {
            font-weight: 900;
            color: #fff;
            font-size: $font-size-large-x;
            margin: 20px 0;
          }
          .song {
            @include no-wrap();
            line-height: 52px;
          }
        }
        // 右侧图片
        .icon {
          flex: 0 0 200px;
          width: 200px;
          height: 200px;
          img {
            width: 100%;
          }
        }
      }
      .loading-container {
        position: absolute;
        width: 100%;
        top: 50%;
        transform: translateY(-50%);
      }
    }

    // 排行榜单详情页 入场动画
    .slide-enter-active, .slide-leave-active {
      transition: all 0.3s;
    }
    .slide-enter, .slide-leave-to {
      transform: translate3d(100%, 0, 0);
    }
  }
</style>
