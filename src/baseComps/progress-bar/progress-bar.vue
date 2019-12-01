<template>
  <!--进度条-->
  <div class="progress-bar" ref="progressBar" @click="progressClick">
    <!--整体背景色-->
    <div class="bar-inner">
      <!--进度条的宽度-->
      <div class="progress" ref="progress"></div>
      <!--进度条的按钮-->
      <!--touchstart加prevent会导致在这块区域内click无效-->
      <div class="progress-btn-wrapper"
           @touchstart="progressTouchStart"
           @touchmove.prevent="progressTouchMove"
           @touchend="progressTouchEnd"
           ref="btn"
      >
        <!--实际圆圈btn-->
        <div class="progress-btn" ref="btnWidth"></div>
      </div>
    </div>
  </div>
</template>

<script>
    import { prefix } from '@common/js/dom';

    const transform = prefix('transform');

    export default {
      name: 'progress-bar',
      props: {
        percent: {
          type: Number,
          default: 0,
        },
      },
      created() {
        // 不需要数据绑定
        this.touch = {};
      },
      methods: {
        // 滑动滚动条
        progressTouchStart(e) {
          // 用来判断处于滑动时候，不应该执行watch的percent
          this.touch.inited = true;
          this.touch.startX = e.touches[0].pageX;
          // 当前的进度条宽度
          this.touch.left = this.$refs.progress.clientWidth;
        },
        // 滑动进行时
        progressTouchMove(e) {
          if(!this.touch.inited) {
            return;
          }
          // 偏移量
          const deltaX = e.touches[0].pageX - this.touch.startX;
          // 拖动界限
          const offsetWidth = Math.min(this.$refs.progressBar.clientWidth
            - this.$refs.btnWidth.clientWidth, Math.max(0, this.touch.left + deltaX));
          // 设置拖动后的宽度
          this._offset(offsetWidth);
        },
        // 滑动结束
        progressTouchEnd() {
          this.touch.inited = false;
          // 派发个事件，告诉当前拖动的位置所占百分比
          this._triggerPercent();
        },
        // 点击改变所占百分比
        progressClick(e) {
          // 黑色背景进度条栏距离视口的各个角落位置
          const rect = this.$refs.progressBar.getBoundingClientRect();
          // 点击时候的偏移量
          const offsetWidth = e.pageX - rect.left;
          // 设置进度条宽度
          this._offset(offsetWidth);
          // 派发所占百分比事件
          this._triggerPercent();
          // 这里当我们点击 progressBtn 的时候，e.offsetX 获取不对
          // this._offset(e.offsetX)
        },
        // 派发事件 当前所占百分比
        _triggerPercent() {
          // 可移动的bar宽度
          const barWidth = this.$refs.progressBar.clientWidth - this.$refs.btnWidth.clientWidth;
          // 当前拖动到的新位置所占百分比
          const percent = this.$refs.progress.clientWidth / barWidth;
          // 告知父级，百分比变化了
          this.$emit('percentChange', percent);
        },
        // 切换歌曲时候使得进度条立马归0
        initWidth() {
          this._offset(0);
        },
        // 进度条宽度实时变化 和 按钮实时变化
        _offset(offsetWidth) {
          this.$refs.progress.style.width = `${offsetWidth}px`;
          this.$refs.btn.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`;
        },
      },
      watch: {
        percent(newVal) {
          // 当没拖动时候在监测
          if(this.percent > 0 && !this.touch.inited) {
            // 可移动的bar宽度
            const barWidth = this.$refs.progressBar.clientWidth - this.$refs.btnWidth.clientWidth;
            // 当前的宽度
            const offsetWidth = newVal * barWidth;
            this._offset(offsetWidth);
          }
        },
      },
    };
</script>

<style lang="scss" scoped>
  .progress-bar {
    height: 60px;
    display: flex;
    align-items: center;
    // 进度条背景色
    .bar-inner {
      position: relative;
      width: 100%;
      height: 8px;
      background: rgba(0,0,0,0.3);
      // 初始宽度为0，宽度是随时间动态变化的
      .progress {
        position: absolute;
        height: 100%;
        left: 0;
        top: 0;
        background: $color-theme
      }
      .progress-btn-wrapper {
        position: absolute;
        width: 60px;
        height: 60px;
        /* -30可能往上偏点*/
        margin-top: -26px;
        // 移到里面真实btn左边
        margin-left: -16px;
        // 为什么不用下面这种，因为操作dom时候，就是操作的transfomr.
        /*transform: translateY(-50%);*/
        // 垂直居中，不需要水平居中
        .progress-btn {
          position: absolute;
          left: 50%;
          top: 50%;
          box-sizing: border-box;
          width: 32px;
          height: 32px;
          border: 6px solid $color-text;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          background: $color-theme;
        }
      }
    }
  }
</style>
