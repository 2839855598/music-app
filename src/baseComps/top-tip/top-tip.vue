<template>
  <!--添加歌曲成功后提示框-->
  <transition name="drop">
    <div class="top-tip" @click.stop="hide" v-show="showFlag">
      <slot></slot>
    </div>
  </transition>
</template>

<script>
    export default {
      name: 'top-tip',
      props: {
        delay: {
          type: Number,
          default: 2000,
        },
      },
      data() {
        return {
          showFlag: false,
        };
      },
      methods: {
        // 供外部调用
        show() {
          this.showFlag = true;
          // 展开后
          clearTimeout(this.timer);
          this.timer = setTimeout(() => {
            this.hide();
          }, this.delay);
        },
        hide() {
          this.showFlag = false;
        },
      },
    };
</script>

<style lang="scss" scoped>
  .top-tip {
    position: fixed;
    top: 0;
    width: 100%;
    background: $color-dialog-background;
    // 从上往下掉落
    &.drop-enter-active, &.drop-leave-active {
      transition: all 0.3s;
    }
    &.drop-enter, &.drop-leave-to {
      transform: translate3d(0, -100%, 0);
    }
  }
</style>
