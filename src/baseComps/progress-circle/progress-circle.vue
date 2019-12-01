<template>
  <div class="progress-circle">
    <svg :width="radius" :height="radius" viewBox="0 0 100 100" version="1.1"
         xmlns="http://www.w3.org/2000/svg">
      <!--背景色圆-->
      <circle class="progress-background" r="50" cx="50" cy="50" fill="transparent"/>
      <!--亮色，在背景色之上-->
      <circle class="progress-bar" r="50" cx="50" cy="50"
              fill="transparent"
              :stroke-dasharray="dashArray"
              :stroke-dashoffset="dashOffset"/>
    </svg>
    <slot></slot>
  </div>
</template>

<script>
    export default {
      name: 'progress-circle',
      props: {
        radius: {
          type: Number,
          default: 100,
        },
        percent: {
          type: Number,
          default: 0,
        },
      },
      data() {
        return {
          // dashArray是以50为半径的周长
          // dashOffset是填充周长的多少
          dashArray: Math.PI * 100,
        };
      },
      computed: {
        dashOffset() {
          return (1 - this.percent) * this.dashArray;
        },
      },
    };
</script>

<style lang="scss" scoped>
  .progress-circle {
    position: relative;
    circle {
      stroke-width: 16px;
      transform-origin: center;
      &.progress-background {
        transform: scale(0.9);
        stroke: $color-theme-d;
      }
      &.progress-bar {
        // 向上旋转90deg开始
        transform: scale(0.9) rotate(-90deg);
        stroke: $color-theme;
      }
    }
  }
</style>
