<template>
  <!--歌单详情页-->
  <music-list :title="title" :bgImage="bgImage" :songs="songs"></music-list>
</template>

<script>
    // 音乐列表组件
    import MusicList from '@components/music-list/music-list';
    import { createNewSong } from '@common/js/song';
    import { mapState } from 'vuex';

    const MAXNUM = 6;

    export default {
      name: 'diss-detail',
      data() {
        return {
          songs: [],
          // 限制getVkey获取次数，有可能一直递归下去，所以作限制
          vkNum: 0,
        };
      },
      computed: {
        ...mapState([
          'dissC',
        ]),
        title() {
          return this.dissC.title;
        },
        bgImage() {
          return this.dissC.cover;
        },
      },
      created() {
        if(!this.dissC['content_id']) {
          this.$router.push({ path: '/recommend' });
          // 一定要，否则还会继续执行下面的this._getSongList方法
          return;
        }
        this._getSongList(this.dissC['content_id']);
      },
      methods: {
        _getSongList(id) {
          this.$api.music.getDissList(id)
            .then(({ data: { cdlist } }) => {
              const songsList = cdlist[0].songlist;
              // normal里面有ajax请求，不能用赋值方式
              // (this.singers = this._normalizeSongs(songsList))
              this._normalizeSongs(songsList);
            });
        },
        _normalizeSongs(list) {
          let midList = [];
          midList = list.map(item => item.mid);
          if(midList.length) {
            this.$api.music.getSongVkey(midList)
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
                  if(item.id && item.album.mid) {
                    const { vkey, filename } = midurlinfo[index];
                    // 没vkey, 就没播放源，就等于这首歌废了，只有能播放的才显示出来
                    if(vkey) {
                      // 添加歌曲
                      this.songs.push(createNewSong(item, vkey, filename));
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
  .detail {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: yellow;
  }
</style>
