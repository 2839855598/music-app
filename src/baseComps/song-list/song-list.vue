<template>
  <div class="song-list">
    <ul>
      <li @click="selectItem(song, index)" class="item" v-for="(song, index) in songs" :key="index">
        <div class="rank" v-if="rank">
          <span :class="getRankLevel(index)" v-text="getRankText(index)"></span>
        </div>
        <div class="content">
          <h2 class="name">{{song.name}}</h2>
          <p class="desc">{{getDesc(song)}}</p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
    export default {
      name: 'song-list',
      props: {
        songs: {
          type: Array,
          default: () => [],
        },
        rank: {
          type: Boolean,
          default: false,
        },
      },
      methods: {
        // 歌曲描述信息
        getDesc(song) {
          return `${song.singer}·${song.album}`;
        },
        // 前几个返回icon类名，后面几个返回text类名
        getRankLevel(index) {
          if(index <= 2) {
            return `icon icon${index}`;
          }
          return 'text';
        },
        // 类名为text的才会有内容
        getRankText(index) {
          if(index > 2) {
            return index + 1;
          }
        },
        // 选中当前歌曲
        selectItem(item, index) {
          this.$emit('select', item, index);
        },
      },
    };
</script>

<style lang="scss" scoped>
  .song-list {
    .item {
      display: flex;
      align-items: center;
      font-size: $font-size-medium;
      height: 128px;
      .rank {
        flex: 0 0 50px;
        width: 50px;
        margin-right: 60px;
        text-align: center;
        .icon {
          display: inline-block;
          width: 50px;
          height: 48px;
          &.icon0 {
            @include bg-image('images/first');
          }
          &.icon1 {
            @include bg-image('images/second');
          }
          &.icon2 {
            @include bg-image('images/third');
          }
        }
        .text {
          color: $color-theme;
          font-size: $font-size-large;
        }
      }
      .content {
        flex: 1;
        line-height: 40px;
        overflow: hidden;
        .name {
          color: $color-text;
          @include no-wrap();
        }
        .desc {
          margin-top: 8px;
          color: $color-text-d;
          @include no-wrap();
        }
      }
    }
  }
</style>
