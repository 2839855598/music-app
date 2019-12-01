<template>
  <div class="search-list">
    <transition-group name="list" tag="ul">
      <li
        @click="selectItem(item)"
        class="search-item"
        v-for="item in searches"
        :key="item"
      >
        <span class="text">{{item}}</span>
        <span @click.stop="deleteItem(item)" class="icon">
          <i class="icon-delete"></i>
        </span>
      </li>
    </transition-group>
  </div>
</template>

<script>
    export default {
      name: 'search-list',
      props: {
        searches: {
          tyep: Array,
          default: [],
        },
      },
      methods: {
        // 选择item，派发事件给父组件，自己不处理逻辑(因为是基础组件)
        selectItem(item) {
          this.$emit('select', item);
        },
        // 删除item, 派发事件给父组件，自己不处理逻辑(因为是基础组件)
        deleteItem(item) {
          this.$emit('delete', item);
        },
      },
    };
</script>

<style lang="scss" scoped>
  .search-list {
    .search-item {
      display: flex;
      align-items: center;
      height: 80px;
      overflow: hidden;
      &.list-enter-active, &.list-leave-active {
        transition: all 0.1s;
      }
      &.list-enter, &.list-leave-to {
        height: 0;
      }
      .text {
        flex: 1;
        color: $color-text-l;
      }
      .icon {
        .icon-delete {
          font-size: $font-size-small;
          color: $color-text-d;
        }
      }
    }
  }
</style>
