<template>
  <!--搜索后的歌曲列表-->
  <scroll
    class="suggest"
    :data="result"
    :pullup="pullup"
    :beforeScroll="beforeScroll"
    ref="suggest"
    @scrollToEnd="searchMore"
    @beforeScroll="listenScroll"
  >
    <ul class="suggest-list">
      <li @click="selectItem(item)"
          class="suggest-item"
          v-for="(item, index) in result"
          :key="index"
      >
        <div class="icon">
          <i :class="getIconCls(item)"></i>
        </div>
        <div class="name">
          <p class="text" v-html="getDisplayName(item)"></p>
        </div>
      </li>
      <!--当还可以加载数据时候，就一直在数据的底部显示loading，不可在加载数据就隐藏-->
      <loading v-if="hasMore" title=""></loading>
    </ul>
    <!--搜索无结果 界面，使用伪类实现，就不使用组件方式了-->
    <!--<div class="no-result-wrapper" v-show="!hasMore && !result.length">
      &lt;!&ndash;title是个写死的数据， :title才是动态属性&ndash;&gt;
      <no-result title="抱歉，暂无搜索结果"></no-result>
    </div>-->
  </scroll>
</template>

<script>
    import Scroll from '@baseComps/scroll/scroll';
    import Loading from '@baseComps/loading/loading';
    // import NoResult from '@baseComps/no-result/no-result';
    import { mapMutations, mapActions } from 'vuex';
    import { createSong } from '@common/js/song';
    import Singer from '@common/js/singer';

    const TYPE_SINGER = 'singer';
    const MAXNUM = 6;
    const perpage = 20;
    export default {
      name: 'suggest',
      props: {
        query: {
          type: String,
          default: '',
        },
      },
      data() {
        return {
          result: [],
          // 限制getVkey获取次数，有可能一直递归下去，所以作限制
          vkNum: 0,
          page: 1,
          // 是否下拉加载数据
          pullup: true,
          // 是否还有更多数据
          hasMore: true,
          // 加载更多数据时候，只能添加一次歌手
          isOneSinger: true,
          // 是否监听刚开始滚动事件
          beforeScroll: true,
        };
      },
      methods: {
        // 刷新滚动栏，供父组件使用
        refresh() {
          this.$refs.suggest.refresh();
        },
        // 获取搜索到的列表
        // 根据查询关键词，重新获取数据
        _getSearchList(query, page, perpages) {
          // 初始化
          this.hasMore = true;
          this.page = 1;
          this.isOneSinger = true;
          this.vkNum = 0;
          // 每次重新获取初始化数组
          this.result = [];
          this.$api.music.getSearchList(query, page, perpages)
            .then(({ data: { data } }) => {
               // 因为_normalizeSongs里有ajax请求，所以不能用赋值方式
               this._normalizeSearchList(data);
               // 检查是否还有数据
               this._checkMore(data);
            });
        },
        // 格式化数据
        _normalizeSearchList(data) {
           // 搜索的关键词是歌手 或者 搜索歌曲返回数据中有歌手
           // 只添加一次
           if(data.zhida && data.zhida.singername && this.isOneSinger) {
             this.isOneSinger = false;
             this.result.push({ ...data.zhida, ...{ type: TYPE_SINGER } });
           }
           // 搜索的关键词是歌曲(必有的)
           if(data.song) {
             // 格式化歌曲列表
             this._normalizeSongs(data.song.list);
           }
        },
        // 格式化歌曲列表，弄成可播放的歌曲
        _normalizeSongs(list) {
          const songMidArr = list.map(item => item.songmid);

          if(songMidArr.length) {
            this.$api.music.getSongVkey(songMidArr)
              .then(({ data: { req_0: { data: { midurlinfo } } } }) => {
                // 正确的数据是每个item里面都有filename
                if(midurlinfo.every(item => !item.filename)) {
                  // 因为有可能一直无限获取vkey，所以作出请求次数限制
                  this.vkNum++;
                  if(this.vkNum >= MAXNUM) {
                    return;
                  }
                  // return不能省，之后的list.forEach不会执行，性能好一点
                  return this._normalizeSongs(list);
                }
                list.forEach((item, index) => {
                  if(item.songmid && item.albummid) {
                    const { vkey, filename } = midurlinfo[index];
                    // 因为音乐有版权，所以vkey可能获取不到
                    // 没有vkey就没法播放音乐，就没必要渲染出来了
                    if(vkey) {
                      // 添加歌曲
                      this.result.push(createSong(item, vkey, filename));
                    }
                  }
                });
              });
          }
        },
        // 动态图片样式
        getIconCls(item) {
          if(item.type === TYPE_SINGER) {
            return 'icon-mine';
          }
          return 'icon-music';
        },
        // 动态内容
        getDisplayName(item) {
          if(item.type === TYPE_SINGER) {
            return item.singername;
          }
          return `${item.name}-${item.singer}`;
        },
        // 下拉加载更多数据
        searchMore() {
          // 没有更多数据的话
          if(!this.hasMore) {
            return;
          }
          this.page++;
          this.$api.music.getSearchList(this.query, this.page, perpage)
            .then(({ data: { data } }) => {
              // 因为_normalizeSongs里有ajax请求，所以不能用赋值方式
              this._normalizeSearchList(data);
              // 检查是否还有数据
              this._checkMore(data);
            });
        },
        // 检测是否还有数据
        _checkMore(data) {
          const { song } = data;
          if(!song.list.length || (song.curnum + (song.curpage - 1) * perpage) >= song.totalnum) {
            this.hasMore = false;
          }
        },
        // 选中搜索结果
        selectItem(item) {
          // 选中的是歌手
          if(item.type === TYPE_SINGER) {
            const singer = new Singer({
              id: item.singerid,
              mid: item.singermid,
              name: item.singername,
            });
            this.$router.push({
              // 不要写成 /singer/${singer.mid}, 因为是search的二级路由
              path: `/search/${singer.mid}`,
            });
            this.setSinger(singer);
          // 选中的是歌曲
          } else {
            // 插入到播放列表
            this.insertSong(item);
          }
          // 派发事件给父组件 做搜索历史(自身组件不做这些逻辑)
          this.$emit('select');
        },
        // 监听一开始滚动事件
        listenScroll() {
          // 向父组件传递事件(search组件)
          this.$emit('listenScroll');
        },
        // vuex中的mutations映射
        ...mapMutations({
          setSinger: 'SET_SINGER',
        }),
        ...mapActions([
          'insertSong',
        ]),
      },
      watch: {
        // 当搜索关键词改变就触发 ajax请求
        query(newQuery) {
          this._getSearchList(newQuery, this.page, perpage);
        },
      },
      components: {
        Scroll,
        Loading,
        // NoResult,
      },
    };
</script>

<style lang="scss" scoped>
  .suggest {
    height: 100%;
    overflow: hidden;
    .suggest-list {
      padding: 0 60px;
      .suggest-item {
        display: flex;
        align-items: center;
        padding-bottom: 40px;
        .icon {
          flex: 0 0 60px;
          width: 60px;
          [class^='icon-'] {
            font-size: $font-size-medium;
            color: $color-text-d;
          }
        }
        .name {
          flex: 1;
          font-size: $font-size-medium;
          color: $color-text-d;
          overflow: hidden;
          .text {
            @include no-wrap();
          }
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
  /*使用伪类实现无结果，不用组件*/
  .suggest-list:empty::before {
    content: '暂无搜索结果';
    display: block;
    line-height: 300px;
    text-align: center;
    color: gray;
  }
</style>
