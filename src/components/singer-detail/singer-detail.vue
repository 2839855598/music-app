<template>
  <music-list :title="title" :bg-image="bgImage" :songs="songsList"></music-list>
</template>

<script>
    import MusicList from '@components/music-list/music-list';
    import { mapState } from 'vuex';
    import { createSong } from '@common/js/song';

    const ERROR_OK = 0;
    const MAXNUM = 6;

    export default {
      name: 'singer-detail',
      data() {
        return {
          songsList: [],
          // 限制getVkey获取次数，有可能一直递归下去，所以作限制
          vkNum: 0,
        };
      },
      computed: {
        ...mapState([
            'singer',
        ]),
        title() {
          return this.singer.name;
        },
        bgImage() {
          return this.singer.picUrl;
        },
      },
      created() {
        // 获取该歌手所有可播放歌曲列表
        this._getSingerSongs();
      },
      methods: {
        // 获取该歌手所有可播放歌曲列表
        _getSingerSongs() {
          // 当前页面刷新时候不存在singer会报错，所以返回上一页
          if(!this.singer.id) {
            this.$router.push('/singer');
            return;
          }
          this.$api.music.getSingerSonglist({ mid: this.singer.mid })
            .then(({ data: { code, data: { list } } }) => {
              if(ERROR_OK === code) {
                // normal里面有ajax请求，不能用赋值方式
                // (this.singers = this._normalizeSongs(songsList))
                this._normalizeSongs(list);
              }
            });
        },
        // 格式化数据，组成想要的数据类型
        _normalizeSongs(list) {
          const songMidArr = [];

          list.forEach((item) => {
            const { musicData: { songmid } } = item;
            songMidArr.push(songmid);
          });

          if(songMidArr.length) {
            this.$api.music.getSongVkey(songMidArr)
              .then(({ data: { req_0: { data: { midurlinfo } } } }) => {
                // 正确的数据是每个item里面都有filename
                if(midurlinfo.every(item => !item.filename)) {
                  // 因为有可能一直无限获取vkey，所以作出请求次数限制
                  this.vkNum++;
                  if(this.vkNum >= MAXNUM) {
                    return;
                  }
                  // return不能省，之后的list.forEach不会执行，性能好一点
                  return this._normalizeSongs(list);
                }
                list.forEach((item, index) => {
                  const { musicData } = item;
                  if(musicData.songmid && musicData.albummid) {
                    const { vkey, filename } = midurlinfo[index];
                    // 因为音乐有版权，所以vkey可能获取不到
                    // 没有vkey就没法播放音乐，就没必要渲染出来了
                    if(vkey) {
                      // 添加歌曲
                      this.songsList.push(createSong(musicData, vkey, filename));
                    }
                  }
                });
              });
          }
        },
      },
      components: {
        MusicList,
      },
    };
</script>

<style lang="scss" scoped>
</style>
