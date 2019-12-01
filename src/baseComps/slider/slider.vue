<template>
  <div class="slider" ref="slider">
    <div class="slider-group" ref="sliderGroup">
      <slot>
        <!--插槽里-->
        <div v-for="(item, index) in recommends" class="slider-item" :key="index">
          <a :href="item.linkUrl">
            <img :src="item.picUrl" @load="loadImg" >
          </a>
        </div>
      </slot>
    </div>
    <!--按钮-->
    <div class="dots-wrapper">
      <div class="dots">
        <span
          class="dot"
          v-for="(item, index) in dots"
          :class="{'active': currentIndex === index}"
          :key="index">
        </span>
      </div>
    </div>
  </div>
</template>

<script>
    import BScroll from 'better-scroll';

    export default {
      name: 'slider',
      props: {
        recommends: {
          type: Array,
          default: () => [],
        },
        loop: {
          type: Boolean,
          default: true,
        },
        autoPlay: {
          type: Boolean,
          default: true,
        },
        interval: {
          type: Number,
          default: 4000,
        },
      },
      data() {
        return {
          dots: new Array(this.recommends.length),
          currentIndex: 0,
        };
      },
      mounted() {
        this.$nextTick(() => {
          // 初始化滚动容器
          this._initSlider();
          // 如果是自动轮播的话
          if(this.autoPlay) {
            this._play();
          }
        });
      },
      methods: {
        // 初始化滚动容器
        // 缺点是滑动距离太大，导致划过好几张图片，不是一张
        _initSlider() {
          this.slider = new BScroll(this.$refs.slider, {
            scrollX: true,
            scrollY: false,
            // 当快速滑动时是否开启滑动惯性，默认为true，
            // true的话，就是快速滑动时候能 滑动好几张图片，效果不好
            momentum: false,
            click: true,
            snap: {
              // 是否无缝循环轮播
              loop: this.loop,
              // 用手指滑动时页面可切换的阀值，大于这个阀值时可以滑动到下一页
              threshold: 0.3,
              // 轮播图切换的动画时间
              speed: 300,
            },
          });
          this.slider.on('scrollEnd', () => {
            const pageIndex = this.slider.getCurrentPage().pageX;
            this.currentIndex = pageIndex;

            // 自动开始下一次
            if(this.autoPlay) {
              clearTimeout(this.timer);
              this._play();
            }
          });
        },
        _play() {
          this.timer = setTimeout(() => {
            // 播放下一个
            this.slider.next();
          }, this.interval);
        },
        // 有可能轮播图加载更慢，导致BScroll高度没计算准确，所以一旦图片加载
        // 完成，重新刷新BScroll高度
        loadImg() {
          // 只执行一次
          if(!this.checkImg) {
            this.checkImg = true;
            // 通知父级滚动条刷新
            this.$emit('refresh');
          }
        },
      },
      // 组件激活时执行，开始定时器
      activated() {
        if (this.autoPlay) {
          this._play();
        }
      },
      // 组件失活时候执行,关闭定时器
      deactivated() {
        clearTimeout(this.timer);
      },
      watch: {
        recommends(newVal) {
          this.dots = new Array(newVal.length);
        },
      },
    };
</script>

<style lang="scss" scoped>
  .slider {
    overflow: hidden;
    .slider-group {
      display: inline-flex;
      .slider-item {
        // 视口宽度
        width: 100vw;
        a {
          display: block;
          width: 100%;
          img {
            width: 100%;
          }
        }
      }
    }
    .dots-wrapper {
      position: relative;
      .dots {
        position: absolute;
        left: 0; right: 0;
        bottom: 24px;
        display: flex;
        justify-content: center;
        .dot {
          margin: 0 8px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: $color-text-l;
          &.active {
            width: 40px;
            border-radius: 10px;
            background: $color-text-ll;
          }
        }
      }
    }
  }
</style>
