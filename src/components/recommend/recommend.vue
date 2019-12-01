<template>
  <!-- 推荐页面 -->
  <div class="recommend" ref="recommend">
    <scroll :data="mvList" class="scroll" ref="scroll">
      <div class="recommend-content">
        <!-- 当获得数据时候在渲染子组件，有利于bscroll计算 -->
        <div v-if="recommends.length" class="slider-wrapper">
          <!--slider组件-->
          <slider :recommends="recommends" @refresh="scrollRefresh" >
          </slider>
        </div>
        <!--歌单列表-->
        <div class="recommend-list">
          <h1 class="list-title">热门歌曲推荐</h1>
          <ul>
            <li @click="selectItem(item)" v-for="(item, index) in mvList" class="item" :key="index">
              <div class="icon">
                <img v-lazy="item.cover" alt="">
              </div>
              <div class="text">
                <h2 class="title">{{item.title}}</h2>
                <p class="username">{{item.username}}</p>
              </div>
            </li>
          </ul>
        </div>
        <div v-if="!mvList.length" class="loading-wrapper">
          <loading></loading>
        </div>
      </div>
    </scroll>
    <!--歌单详情页-->
    <transition name="slide">
      <router-view></router-view>
    </transition>
  </div>
</template>

<script>
    // 轮播图组件
    import Slider from '@baseComps/slider/slider';
    // 滚动组件
    import Scroll from '@baseComps/scroll/scroll';
    // loading组件
    import Loading from '@baseComps/loading/loading';
    // mixins，一些通用地方
    import { playListMixin } from '@common/js/mixin';
    // 辅助函数
    import { mapMutations } from 'vuex';

    // 图片懒加载
    const ERR_OK = 0;
    export default {
      name: 'recommend',
      mixins: [playListMixin],
      data() {
        return {
          recommends: [],
          mvList: [],
        };
      },
      created() {
        // 测试用的
        // 延迟加载，导致BScroll高度计算错误，没法滚动到底，
        // 因为这个延迟加载的高度没计算上去。
        /* setTimeout(() => {
          this._getRecommend();
        }, 2000); */

        // 获取轮播图数据
        this._getRecommend();
        // 获取歌单数据
        this._getMvList();
      },
      methods: {
        // 处理当有音乐播放时候，滚动栏距离底部的高度为 mini-player的高度
        handlePlaylist(playList) {
          const bottom = playList.length > 0 ? `${this.miniHeight}px` : '';
          this.$refs.recommend.style.marginBottom = bottom;
          // 滚动栏刷新
          this.$refs.scroll.refresh();
        },
        // 请求轮播图数据
        _getRecommend() {
          this.$api.music.getPicList().then(({ data: { data, code } }) => {
            if(code === ERR_OK) {
              this.recommends = data.slider;
            }
          });
        },
        // 歌单数据
        _getMvList() {
          this.$api.music.getMvList().then(({ data: { recomPlaylist: { data, code } } }) => {
            if(code === ERR_OK) {
              this.mvList = data['v_hot'];
            }
          });
        },
        // 进入歌单详情页
        selectItem(item) {
          this.$router.push({
            name: 'dissDetail',
            params: {
              id: item.id,
            },
          });
          // 设置vuex全局 歌单对象
          this.setDissC(item);
        },
        // 如果slider后加载完成，里面图片加载完成，就通知父组件，
        // 重新刷新BScroll
        scrollRefresh() {
          this.$refs.scroll.refresh();
        },
        ...mapMutations({
          setDissC: 'SET_DISSC',
        }),
      },
      components: {
        Slider,
        Scroll,
        Loading,
      },
    };
</script>

<style lang="scss" scoped>
  .recommend {
    flex: 1;
    overflow: hidden;
    .scroll {
      height: 100%;
      overflow: hidden;
      .recommend-list {
        .list-title {
          line-height: 130px;
          text-align: center;
          font-size: $font-size-medium;
          color: $color-theme;
        }
        .item {
          display: flex;
          padding: 0 40px 40px 40px;
          justify-content: center;
          .icon {
            flex: 0 0 120px;
            width: 120px;
            padding-right: 40px;
            img {
              width: 100%;
            }
          }
          .text {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            line-height: 40px;
            overflow: hidden;
            font-size: $font-size-medium;
            .title {
              margin-bottom: 10px;
              color: $color-text;
            }
            .username {
              color: $color-text-d;
            }
          }
        }
      }
      .loading-wrapper {
        position: absolute;
        width: 100%;
        top: 50%;
        transform: translateY(-50%);
      }
    }
    // 歌单详情页 入场动画
    .slide-enter-active, .slide-leave-active {
      transition: all 0.3s;
    }
    .slide-enter, .slide-leave-to {
      transform: translate3d(100%, 0, 0);
    }
  }
</style>
