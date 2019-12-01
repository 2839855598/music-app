<template>
  <div class="no-result">
    <div class="no-result-icon"></div>
    <p class="no-result-text">{{title}}</p>
  </div>
</template>

<script>
    export default {
      props: {
        title: {
          type: String,
          default: '',
        },
      },
      name: 'no-result',
    };
</script>

<style lang="scss" scoped>
  .no-result {
    text-align: center;
    .no-result-icon {
      width: 172px;
      height: 180px;
      margin: 0 auto;
      @include bg-image('images/no-result');
    }
    .no-result-text {
      margin-top: 60px;
      font-size: $font-size-medium;
      color: $color-text-d;
    }
  }
</style>
