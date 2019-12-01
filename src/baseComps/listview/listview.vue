<template>
  <scroll
    class="listview"
    :data="data"
    :listenScroll="listenScroll"
    @scroll="scroll"
    :probeType="probeType"
    ref="scroll">
    <ul>
      <li v-for="(group, index) in data"  class="list-group" ref="listGroup" :key="index">
        <h2 class="list-group-title">{{group.title}}</h2>
        <ul>
          <li @click="selectItem(item)" v-for="(item, index) in group.list" :key="index"
              class="list-group-item">
            <img class="avatar" v-lazy="item.picUrl" >
            <span class="name">{{item.name}}</span>
          </li>
        </ul>
      </li>
    </ul>
    <!--事件委托，没有绑定在li上，而是父级上面-->
    <div class="list-shortcut"
         @touchstart="onShortcutTouchStart"
         @touchmove.stop="onShortcutTouchMove"
    >
      <ul>
        <li
          v-for="(item, index) in shortcutList"
          :data-index="index"
          class="item"
          :key="index"
          ref="item"
          :class="{'current': currentIndex === index}"
        >
          {{item}}
        </li>
      </ul>
    </div>
    <div class="list-fixed" ref="fixed" v-show="fixedTitle">
      <div class="fixed-title">{{fixedTitle}}</div>
    </div>
    <!--loading-->
    <div v-if="!data || !data.length" class="loading-container">
      <loading></loading>
    </div>
  </scroll>
</template>

<script>
    // 滚动组件
    import Scroll from '@baseComps/scroll/scroll';
    // 获取data-开头属性
    import getDomProper from '@common/js/dom';
    import Loading from '@baseComps/loading/loading';

    export default {
      name: 'listview',
      props: {
        data: {
          type: Array,
          default: () => [],
        },
      },
      data() {
        return {
          scrollY: -1,
          currentIndex: 0,
          differ: -1,
        };
      },
      computed: {
        shortcutList() {
          return this.data.map(item => item.title.substring(0, 1));
        },
        fixedTitle() {
          // 当滚动到顶部，继续往上拉的时候
          if(this.scrollY > 0) {
            return '';
          }
          // 存在数据时候返回数据内容
          return this.data[this.currentIndex]
            ? this.data[this.currentIndex].title : '';
        },
      },
      created() {
        // 放在这里初始化，为了不让检测这个数据，因为data和props中数据都会被vue检测
        this.touch = {};
        // 不需要监听
        this.listenScroll = true;
        // 左侧 所有一级li的高度集合
        this.listHeight = [];
        // 3代表实时派发滚动事件和 momentum也实时监测
        this.probeType = 3;
      },
      methods: {
        // 重新刷新
        refresh() {
          this.$refs.scroll.refresh();
        },
        // 右侧点击对应的索引
        onShortcutTouchStart(e) {
          // 右侧目标索引, 字符串要转为 数字
          const anchorIndex = parseInt(getDomProper(e.target, 'index'), 10);
          const firstTouch = e.touches[0];
          this.touch.y1 = firstTouch.pageY;
          this.touch.anchorIndex = anchorIndex;

          // 左侧dom滚动，第二个参数为 过渡时间
          this._scrollTo(anchorIndex);
        },
        // 右侧滚动，先点击，然后跟随滚动，向下就向下滚动，向上就向上滚动
        onShortcutTouchMove(e) {
          const firstTouch = e.touches[0];
          this.touch.y2 = firstTouch.pageY;
          // item的clientHeight
          const clientH = this.$refs.item[0].clientHeight;
          //  Math.floor
          const delta = Math.floor((this.touch.y2 - this.touch.y1) / clientH);
          // 右侧滚动的索引
          const anchorIndex = this.touch.anchorIndex + delta;
          // 右侧滚动 联动左侧滚动
          this._scrollTo(anchorIndex);
        },
        _scrollTo(index) {
          // 点击右侧字母栏顶部空白黑色区域 或者 底部空白黑色区域时候
          if(!index && index !== 0) {
            return;
          }
          // 右侧字母栏按住滑动到顶部或者底部 时候，超出的处理
          if(index < 0) {
            index = 0;
          } else if (index > this.listHeight.length - 2) {
            index = this.listHeight.length - 2;
          }
          // 点击右侧字母，改变this.scrollY,触发watch中的this.currentIndex变化
          this.scrollY = -this.listHeight[index];
          this.$refs.scroll.scrollToElement(this.$refs.listGroup[index], 0);
        },
        _calculateHeight() {
          // 多次重新计算的话，需要初始化为空数组
          this.listHeight = [];
          const list = this.$refs.listGroup;
          let height = 0;
          this.listHeight.push(height);
          for(let i = 0, len = list.length; i < len; i++) {
            const item = list[i];
            height += item.clientHeight;
            this.listHeight.push(height);
          }
        },
        scroll(pos) {
          this.scrollY = pos.y;
        },
        // 点击歌手，派发事件给父级
        selectItem(item) {
          this.$emit('select', item);
        },
      },
      watch: {
        // 动态计算一级li高度
        data() {
          // 为什么不用this.$nextTick，因为不够准确，
          // 会导致计算高度错误，所以用20ms一定能正确计算到
          setTimeout(() => {
            this._calculateHeight();
          }, 20);
        },
        // 实时监测滚动，然后计算出currentIndex
        scrollY(newVal) {
          const { listHeight } = this;
          // 当滚动到顶部时候，向上滚动是正值，newVal > 0,
          if(newVal > 0) {
            this.currentIndex = 0;
            return;
          }

          // 在中间部分滚动
          for(let i = 0; i < listHeight.length - 1; i++) {
            const height1 = listHeight[i];
            const height2 = listHeight[i + 1];
            // 向下滚动是负值，向上是正值，要取绝对值
            if((Math.abs(newVal) >= height1 && Math.abs(newVal) < height2)) {
              this.currentIndex = i;
              // differ是当前标题距离视口顶部的高度
              // newVal是已经滚动的高度，是负值
              this.differ = height2 + newVal;
              // 终止循环
              return;
            }
          }
          // 当滚动到底部时候，并且 Math.abs(newVal) 大于最后一个元素的上限(累计高度之和)
          // 为什么减去2，因为左边本身比右边多一个元素(0), 所以要减2，就是右边最后一个
          // 比如右边 21个，最大索引20， 左边22个，最大索引也应该是20,所以要减去2
          this.currentIndex = listHeight.length - 2;
        },
        differ(newVal) {
          const TitleHeight = this.$refs.fixed.clientHeight;
          // 意思就是两者接触的时候，fixedTitle往上走
          // 当两者相距很远时候，都是为0
          const fixedTop = (newVal > 0 && newVal < TitleHeight) ? newVal - TitleHeight
            : 0;
          // 第一次不存在，不走这里，以后都走这里
          // 因为differ是动态计算，在多数情况下，this.fixedTop为0，
          // 也就是相距很远时候，什么都不执行，fixedTitle不会被下面的标题顶上去
          // 这样是为了性能优化
          if(this.fixedTop === fixedTop) {
            return;
          }
          // 主要为了上一步做的，多数情况下为0
          this.fixedTop = fixedTop;
          // fixedTitle被下面的标题 顶上去了
          this.$refs.fixed.style.transform = `translate3d(0,${fixedTop}px,0)`;
        },
      },
      components: {
        Scroll,
        Loading,
      },
    };
</script>

<style lang="scss" scoped>
  .listview {
    height: 100%;
    overflow: hidden;
    background: $color-background;
    // 防止fixed超出来隐藏不了
    position: relative;
    .list-group {
      padding-bottom: 60px;
      .list-group-title {
        line-height: 60px;
        padding-left: 40px;
        font-size: $font-size-small;
        color: $color-text-l;
        background: $color-highlight-background;
      }
      .list-group-item {
        display: flex;
        align-items: center;
        padding: 40px 0 0 60px;
        .avatar {
          width: 100px;
          border-radius: 50%;
        }
        .name {
          margin-left: 40px;
          color: $color-text-l;
          font-size: $font-size-medium;
        }
      }
    }
    .list-shortcut {
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 40px;
      padding: 40px 0;
      border-radius: 20px;
      text-align: center;
      background: $color-background-d;
      font-family: Helvetica;
      .item {
        padding: 6px;
        line-height: 1;
        color: $color-text-l;
        font-size: $font-size-small;
        &.current {
          color: $color-theme;
        }
      }
    }
    .list-fixed {
      position: absolute;
      top: 0; left: 0;
      width: 100%;
      .fixed-title {
        line-height: 60px;
        padding-left: 40px;
        font-size: $font-size-small;
        color: $color-text-l;
        background: $color-highlight-background;
      }
    }
    .loading-container {
      position: absolute;
      width: 100%;
      top: 50%;
      transform: translateY(-50%);
    }
  }
</style>
