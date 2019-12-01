<template>
  <ul class="switches">
    <li
      class="switch-item"
      v-for="(item, index) in switches"
      :class="{'current': currentIndex === index}"
      @click="switchItem(index)"
      :key="index"
    >
      <span>{{item.name}}</span>
    </li>
  </ul>
</template>

<script>
    export default {
      name: 'switches',
      props: {
        switches: {
          type: Array,
          default: () => [],
        },
        currentIndex: {
          type: Number,
          default: 0,
        },
      },
      methods: {
        // 选择，自身组件不做逻辑，由父组件做逻辑
        switchItem(index) {
          this.$emit('switch', index);
        },
      },
    };
</script>

<style lang="scss" scoped>
  .switches {
    display: flex;
    align-items: center;
    width: 480px;
    margin: 0 auto;
    border: 2px solid $color-highlight-background;
    border-radius: 10px;
    .switch-item {
      flex: 1;
      padding: 16px;
      text-align: center;
      font-size: $font-size-medium;
      color: $color-text-d;
      &.current {
        background: $color-highlight-background;
        color: $color-text;
      }
    }
  }
</style>
