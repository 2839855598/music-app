<template>
  <div class="m-header">
    <div class="icon"></div>
    <h1 class="text">crazy Music </h1>
    <router-link tag="div" class="mine" to="/user">
      <i class="icon-mine"></i>
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'm-header',
};
</script>

<style lang="scss" scoped>
  .m-header {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    text-align: center;
    color: $color-theme;
    .icon {
      margin-right: 18px;
      width: 60px;
      height: 64px;
      @include bg-image('./images/logo');
    }
    .text {
      line-height: 88px;
      font-size: $font-size-large;
    }
    .mine {
      position: absolute;
      top: 0;
      right: 0;
      .icon-mine {
        display: block;
        padding: 24px;
        font-size: 40px;
        color: $color-theme;
      }
    }
  }
</style>
