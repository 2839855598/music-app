<template>
  <div class="scroll-wrapper" ref="wrapper">
    <slot></slot>
  </div>
</template>

<script>
    import BScroll from 'better-scroll';

    export default {
      name: 'scroll',
      props: {
        // 监听scroll事件，1为延迟派发滚动 2为实时派发滚动，3为实时派发滚动+momentum也实时
        probeType: {
          type: Number,
          default: 1,
        },
        click: {
          type: Boolean,
          default: true,
        },
        // 根据数据变化，动态刷新
        data: {
          type: Array,
          default: null,
        },
        listenScroll: {
          type: Boolean,
          default: false,
        },
        // 是否下拉加载数据
        pullup: {
          type: Boolean,
          default: false,
        },
        // 是否监听刚开始滚动事件
        beforeScroll: {
          type: Boolean,
          default: false,
        },
        // 延迟多少ms刷新, 因为有transition包裹的动画会改变整体高度，大约100ms,
        // 影响正确的计算,导致滚动高度不正确
        refreshDelay: {
          type: Number,
          default: 20,
        },
      },
      mounted() {
        // 初始化滚动
        this.$nextTick(() => {
          this._initScroll();
        });
      },
      methods: {
        _initScroll() {
           if(!this.$refs.wrapper) {
             return;
           }
           this.scroll = new BScroll(this.$refs.wrapper, {
             probeType: this.probeType,
             click: this.click,
           });

           // 是否监听滚动
           if(this.listenScroll) {
             this.scroll.on('scroll', (pos) => {
               // 这里this指的是上层函数中的this，因为箭头函数中this是上层this
               this.$emit('scroll', pos);
             });
           }
           // 是否监听下拉
           if(this.pullup) {
             // scrollEnd事件是滚动停止后触发，每次滚动停止后都检测看看是否
             // 快要滑动到底部了
             this.scroll.on('scrollEnd', () => {
               // 快要滚动底的时候，距离底部还有50px左右
               if(this.scroll.y <= (this.scroll.maxScrollY + 50)) {
                 // 这里this指的是上层函数中的this，因为箭头函数中this是上层this
                 this.$emit('scrollToEnd');
               }
             });
           }

           // 是否监听 刚开始滚动事件，因为移动端 input focus时候会弹起键盘，
           // 当滚动列表时候，应该去掉键盘(即input失去焦点 no focus)
           if(this.beforeScroll) {
             this.scroll.on('beforeScrollStart', () => {
               // 这里this指的是上层函数中的this，因为箭头函数中this是上层this
               this.$emit('beforeScroll');
             });
           }
        },
        // 启动better-scroll, 一般用不到
        enable() {
          this.scroll && this.scroll.enable();
        },
        disable() {
          this.scroll && this.scroll.disable();
        },
        scrollTo(...args) {
          this.scroll && this.scroll.scrollTo(...args);
        },
        scrollToElement(...args) {
          this.scroll && this.scroll.scrollToElement(...args);
        },
        refresh() {
          this.scroll && this.scroll.refresh();
        },
      },
      watch: {
        // 当数据变化时候,重新计算滚动高度， 浏览器渲染需要时间，所以价格定时器，
        data() {
          setTimeout(() => {
            this.refresh();
          }, this.refreshDelay);
        },
      },
    };
</script>

<style lang="scss" scoped>
  .scroll-wrapper {
    overflow: hidden;
  }
</style>
