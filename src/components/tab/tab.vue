<template>
  <div class="tab">
    <router-link :to="{name: 'recommend'}" tag="div" class="tab-item">
      <span class="tab-link">推荐</span>
    </router-link>
    <router-link :to="{name: 'singer'}" tag="div" class="tab-item">
      <span class="tab-link">歌手</span>
    </router-link>
    <router-link :to="{name: 'rank'}" tag="div" class="tab-item">
      <span class="tab-link">排行</span>
    </router-link>
    <router-link :to="{name: 'search'}" tag="div" class="tab-item">
      <span class="tab-link">搜索</span>
    </router-link>
  </div>
</template>

<script>
    export default {
      name: 'tab',
    };
</script>

<style lang="scss" scoped>
    .tab {
      display: flex;
      line-height: 88px;
      font-size: $font-size-medium;
      .tab-item {
        flex: 1;
        text-align: center;
        .tab-link {
          padding-bottom: 10px;
          color: $color-text-l;
        }
        &.router-link-active {
          .tab-link {
            color: $color-theme;
            border-bottom: 4px solid $color-theme;
          }
        }
      }
    }
</style>
