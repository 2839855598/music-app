<template>
  <!--search搜索框-->
  <div class="search-box">
    <i class="icon-search"></i>
    <input v-model="query" ref="query" :placeholder="placeholder" class="box" type="text">
    <i v-show="query" @click="clear" class="icon-dismiss"></i>
  </div>
</template>

<script>
    import { debounce } from '@common/js/util';

    export default {
      name: 'search-box',
      props: {
        placeholder: {
          type: String,
          default: '搜索歌曲、歌手',
        },
      },
      data() {
        return {
          query: '',
        };
      },
      created() {
        // 防抖
        this.$watch('query', debounce((newQuery) => {
          this.$emit('query', newQuery);
        }, 200));
      },
      methods: {
        // 清除query
        clear() {
          this.query = '';
        },
        // 设置query，外部调用
        setQuery(query) {
          this.query = query;
        },
        // 失去焦点（给父级组件用）
        blur() {
          this.$refs.query.blur();
        },
      },
    };
</script>

<style lang="scss" scoped>
  .search-box {
    display: flex;
    align-items: center;
    padding: 0 12px;
    height: 80px;
    background: $color-highlight-background;
    border-radius: 12px;
    .icon-search {
      font-size: $font-size-large-x-x;
      color: $color-text;
    }
    .box {
      flex: 1;
      margin: 0 10px;
      line-height: 60px;
      background: $color-highlight-background;
      color: $color-text;
      font-size: $font-size-medium;
      &::placeholder {
        color: $color-text-d;
      }
    }
    .icon-dismiss {
      font-size: $font-size-medium-x;
      color: $color-background;
    }
  }
</style>
