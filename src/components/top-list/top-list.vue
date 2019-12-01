<template>
  <!--排行榜详情页-->
  <music-list :rank="rank" :title="title" :bg-image="bgImage" :songs="songs"></music-list>
</template>

<script>
    import { mapState } from 'vuex';
    import MusicList from '@components/music-list/music-list';
    import { createSong } from '@common/js/song';
    import { getTopList } from '@/api/music-jsonp';

    const MAXNUM = 6;

    export default {
      name: 'top-list',
      computed: {
        ...mapState([
          'topList',
        ]),
        title() {
          return this.topList.title;
        },
        bgImage() {
          return this.topList.mbFrontPicUrl;
        },
      },
      data() {
        return {
          songs: [],
          rank: true,
          // 限制getVkey获取次数，有可能一直递归下去，所以作限制
          vkNum: 0,
        };
      },
      created() {
        if(!this.topList.topId) {
          this.$router.push('/rank');
          return;
        }
        this._getTopList(this.topList.topId);
      },
      methods: {
        // 获取当前排行榜歌曲列表
        _getTopList(id) {
          getTopList(id)
            .then((res) => {
              // normal里面有ajax请求，不能用赋值方式
              // (this.singers = this._normalizeSongs(songsList))
              this._normalizeRankSongs(res.songlist);
            });
        },
        // 格式化数据
        _normalizeRankSongs(list) {
          const midArr = list.map(item => item.data.songmid);
          if(midArr.length) {
            this.$api.music.getSongVkey(midArr)
              .then(({ data: { req_0: { data: { midurlinfo } } } }) => {
                // 正确的数据是每个item里面都有filename
                if(midurlinfo.every(item => !item.filename)) {
                  // 因为有可能一直无限获取vkey，所以作出请求次数限制
                  this.vkNum++;
                  if(this.vkNum >= MAXNUM) {
                    return;
                  }
                  // return不能省，之后的list.forEach不会执行，性能好一点
                  return this._normalizeRankSongs(list);
                }
                list.forEach((item, index) => {
                  const musicData = item.data;
                  if(musicData.songmid && musicData.albummid) {
                    const { vkey, filename } = midurlinfo[index];
                    // 因为音乐有版权，所以vkey可能获取不到
                    // 没有vkey就没法播放音乐，就没必要渲染出来了
                    if(vkey) {
                      // 添加歌曲
                      this.songs.push(createSong(musicData, vkey, filename));
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
 .toplist {
   position: fixed;
   left: 0;
   top: 0;
   right: 0;
   bottom: 0;
   background: #ddd;
 }
</style>
