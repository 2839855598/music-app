<template>
  <div class="loading">
    <img src="./images/loading.gif" alt="正在加载中">
    <p class="desc">{{title}}</p>
  </div>
</template>

<script>
    export default {
      name: 'loading',
      props: {
        title: {
          type: String,
          default: '正在载入...',
        },
      },
    };
</script>

<style lang="scss" scoped>
  .loading {
    text-align: center;
    img {
      width: 48px;
    }
    .desc {
      line-height: 40px;
      font-size: $font-size-small;
      color: $color-text-l;
    }
  }
</style>
