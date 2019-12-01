<template>
  <!-- 提示框-->
  <transition name="confirm-fade">
    <!--全屏定位-->
    <!--阻止点击向外冒泡-->
    <div class="confirm" v-show="showFlag" @click.stop>
      <!--全屏中间定位-->
      <div class="confirm-wrapper">
        <div class="confirm-content">
          <p class="text">{{text}}</p>
          <div class="operate">
            <div @click="cancel" class="operate-btn left">{{cancelBtnText}}</div>
            <div @click="confirm" class="operate-btn">{{confirmBtnText}}</div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
    export default {
      name: 'confirm',
      props: {
        text: {
          type: String,
          default: '',
        },
        confirmBtnText: {
          type: String,
          default: '确定',
        },
        cancelBtnText: {
          type: String,
          default: '取消',
        },
      },
      data() {
        return {
          showFlag: false,
        };
      },
      methods: {
        // 可供外部控制显隐
        show() {
          this.showFlag = true;
        },
        // 可供外部控制显隐
        hide() {
          this.showFlag = false;
        },
        // 取消
        cancel() {
          this.hide();
          // 派发事件给父组件，基础组件不作 逻辑处理
          this.$emit('cancel');
        },
        // 确定
        confirm() {
          this.hide();
          // 派发事件给父组件，基础组件不作 逻辑处理
          this.$emit('confirm');
        },
      },
    };
</script>

<style lang="scss" scoped>
  .confirm {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 5;
    background-color: $color-background-d;
    &.confirm-fade-enter-active {
      // 外层动画
      animation: confirm-fadein 0.3s;
      // 内层动画
      .confirm-content {
        animation: confirm-zoom 0.3s;
      }
    }
    .confirm-wrapper {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      .confirm-content {
        width: 540px;
        border-radius: 26px;
        background: $color-highlight-background;
        .text {
          padding: 38px 30px;
          line-height: 44px;
          text-align: center;
          font-size: $font-size-large;
          color: $color-text-l;
        }
        .operate {
          display: flex;
          align-items: center;
          text-align: center;
          font-size: $font-size-large;
          .operate-btn {
            flex: 1;
            line-height: 44px;
            padding: 20px 0;
            border-top: 2px solid $color-background-d;
            color: $color-text-d;
            &.left {
              border-right: 2px solid $color-background-d;
            }
          }
        }
      }
    }
  }


  @keyframes confirm-fadein {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
  @keyframes confirm-zoom {
    0% {
      transform: scale(0);
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
    }
  }
</style>
