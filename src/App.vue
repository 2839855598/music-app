<template>
  <div id="app">
    <!-- 头部 -->
    <m-header></m-header>
    <!-- 导航栏 -->
    <tab></tab>
    <keep-alive>
        <router-view></router-view>
    </keep-alive>
    <!--播放器-->
    <player></player>
  </div>
</template>
<script>
  import MHeader from '@components/m-header/m-header';
  import Tab from '@components/tab/tab';
  // 播放器组件
  import Player from '@components/player/player';

  export default {
    components: {
      MHeader,
      Tab,
      Player,
    },
  };
</script>
<style lang="scss">
  html, body {
    height: 100%;
  }
  #app {
    display: flex;
    flex-direction: column;
    height: 100%;
 }
</style>
