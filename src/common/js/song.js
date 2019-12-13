import music from '@/api/music';

const ERROR_OK = 0;

export default class Song {
  constructor({ id, mid, singer, name, duration, album, image, url }) {
    this.id = id;
    this.mid = mid;
    this.singer = singer;
    this.name = name;
    this.duration = duration;
    this.album = album;
    this.image = image;
    this.url = url;
  }

  getSongLyric() {
    // 多次请求的话
    if(this.lyric) {
      return Promise.resolve(this.lyric);
    }

    return new Promise((resolve, reject) => {
      music.getLyric(this.id).then(({ data: { code, lyric } }) => {
        if(code === ERROR_OK) {
          this.lyric = this.fromcharCodeLyric(lyric);
          resolve(this.lyric);
        } else {
          reject(new Error('no lyric'));
        }
      });
    });
  }

  fromcharCodeLyric(lyric) {
    return lyric.replace(/&#(\d+);/g, (match, submatch) => String.fromCharCode(submatch));
    // 第二种解码方式
    // this.lyric = this.initLyric(lyric);
  }

  initLyric(lyric) {
    const div = document.createElement('div');
    div.innerHTML = lyric;
    return div.textContent || div.innerText;
  }
}
// 存在多个歌手名, 用-连接
export function filterSinger(singer) {
  if(!singer) {
    return '';
  }
  return singer.reduce((total, cur) => {
    const { name } = cur;
    if(name) {
      total.push(name);
    }
    return total;
  }, []).join('-');
}

// 旧的歌手详情页歌曲列表接口 创建的数据（黄佚老师的接口）之所以用这个接口
// 是因为可以获取到更多歌曲，官网默认歌手详情页接口只有10首歌
export function createSong(musicData, vkey, filename) {
  return new Song({
    id: musicData.songid,
    mid: musicData.songmid,
    singer: filterSinger(musicData.singer),
    name: musicData.songname,
    duration: musicData.interval,
    album: musicData.albumname,
    // 查看元素的地址 +album信息得来的
    image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg`,
    // 播放地址抓取移动端的media
    url: `http://aqqmusic.tc.qq.com/amobile.music.tc.qq.com/${filename}?guid=5898566352&vkey=${vkey}&uin=0&fromtag=38`,
  });
}
// 官网歌单详情页 歌曲列表接口 创建的数据（官方接口创建的数据）
// 之所以不继续使用上面的接口，是因为官网的接口可以获取到20多个歌曲了，不少了。
export function createNewSong(newMusic, vkey, filename) {
    return new Song({
      id: newMusic.id,
      mid: newMusic.mid,
      singer: filterSinger(newMusic.singer),
      name: newMusic.name,
      duration: newMusic.interval,
      album: newMusic.album.name,
      // 查看元素的地址 +album信息得来的
      image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${newMusic.album.mid}.jpg`,
      // 播放地址抓取移动端的media
      url: `http://aqqmusic.tc.qq.com/amobile.music.tc.qq.com/${filename}?guid=5898566352&vkey=${vkey}&uin=0&fromtag=38`,
    });
}

export function createUrl(vkey, filename) {
  let url = '';
  url = `http://aqqmusic.tc.qq.com/amobile.music.tc.qq.com/${filename}?guid=5898566352&vkey=${vkey}&uin=0&fromtag=38`;
  return url;
}
