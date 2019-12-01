import ports from './interfaces';
import axios from '../request';
import { commonPcParams } from './config';

// 获取轮播图数据（移动端抓取）
function getPicList() {
  const url = `${ports.dev}api/getPicList`;
  const params = {
    _: 1571908158818,
    g_tk: 5381,
    uin: 0,
    format: 'json',
    inCharset: 'utf-8',
    outCharset: 'utf-8',
    notice: 0,
    platform: 'h5',
    needNewCode: 1,
  };
  return axios.get(url, {
    params,
  });
}
// 获取歌单列表（pc端）
function getMvList() {
  const url = `${ports.dev}api/getMvList`;
  const params = Object.assign({}, commonPcParams, {
    '-': 'recom9761245928522506',
    data: {
      comm: { ct: 24 },
      category: { method: 'get_hot_category', param: { qq: '' }, module: 'music.web_category_svr' },
      recomPlaylist: {
        method: 'get_hot_recommend',
        param: { async: 1, cmd: 2 },
        module: 'playlist.HotRecommendServer',
      },
      playlist: {
        method: 'get_playlist_by_category',
        param: {
          id: 8,
          curPage: 1,
          size: 40,
          order: 5,
          titleid: 8,
        },
        module: 'playlist.PlayListPlazaServer',
      },
      new_song: {
        module: 'newsong.NewSongServer',
        method: 'get_new_song_info',
        param: { type: 5 },
      },
      new_album: {
        module: 'newalbum.NewAlbumServer',
        method: 'get_new_album_info',
        param: { area: 1, sin: 0, num: 10 },
      },
      new_album_tag: { module: 'newalbum.NewAlbumServer', method: 'get_new_album_area', param: {} },
      toplist: { module: 'musicToplist.ToplistInfoServer', method: 'GetAll', param: {} },
      focus: { module: 'QQMusic.MusichallServer', method: 'GetFocus', param: {} },
    },
  });
  return axios.get(url, {
    params,
  });
}

// 获取歌手列表(pc端)
function getSingerList() {
  const url = `${ports.dev}api/getSingerList`;
  const params = Object.assign({}, commonPcParams, {
    '-': 'getUCGI7153872175137714',
    data: {
      comm: { ct: 24, cv: 0 },
      singerList: {
        module: 'Music.SingerListServer',
        method: 'get_singer_list',
        param: {
          area: -100,
          sex: -100,
          genre: -100,
          index: -100,
          sin: 0,
          cur_page: 1,
        },
      },
    },
  });

  return axios.get(url, {
    params,
  });
}

// 歌手歌单列表(歌手详情页) (旧的接口)
function getSingerSonglist({ mid }) {
  const url = `${ports.dev}api/getSongList`;
  const params = {
    hostUin: 0,
    needNewCode: 0,
    platform: 'yqq',
    order: 'listen',
    begin: 0,
    // 获取歌曲数量
    num: 80,
    songstatus: 1,
    singermid: mid,
    g_tk: 1928093487,
    inCharset: 'utf-8',
    outCharset: 'utf-8',
    notice: 0,
    format: 'jsonp',
  };
  return axios.get(url, {
    params,
  });
}

// 获取歌曲的vkey（pc端）
function getSongVkey(midArr) {
  const url = `${ports.dev}api/getSongVkey`;

  const params = Object.assign({}, commonPcParams, {
    '-': 'getplaysongvkey23526164818409767',
    data: {
      req: {
        module: 'CDN.SrfCdnDispatchServer',
        method: 'GetCdnDispatch',
        param: { guid: '5898566352', calltype: 0, userip: '' },
      },
      req_0: {
        module: 'vkey.GetVkeyServer',
        method: 'CgiGetVkey',
        param: {
          guid: '5898566352',
          // 通过参数传递的
          songmid: midArr,
          songtype: Array.from({ length: midArr.length }, () => 0),
          uin: '0',
          loginflag: 1,
          platform: '20',
        },
      },
      comm: { uin: 0, format: 'json', ct: 24, cv: 0 },
    },
  });

  return axios.get(url, {
    params,
  });
}

// 获取歌曲的歌词(移动端)
function getLyric(musicid, musicmid) {
  const url = `${ports.dev}api/getLyric`;
  const params = {
    g_tk: 556108922,
    uin: 0,
    format: 'json',
    inCharset: 'utf-8',
    outCharset: 'utf-8',
    notice: 0,
    platform: 'h5',
    needNewCode: 1,
    nobase64: 1,
    musicid,
    musicmid,
    songtype: 0,
    _: 1573205555556,
  };

  return axios.get(url, {
    params,
  });
}

// 获取歌单详情页(pc端)
function getDissList(disstid) {
  const url = `${ports.dev}api/getDissList`;
  const params = Object.assign({}, commonPcParams, {
    g_tk: 556108922,
    disstid,
    type: 1,
    json: 1,
    utf8: 1,
    onlysong: 0,
    new_format: 1,
  });

  return axios.get(url, {
    params,
  });
}

// 获取排行榜(移动端)
function getRank() {
  const url = `${ports.dev}api/getRank`;
  const params = {
    _: 1573628552373,
    data: {
      comm: {
        g_tk: 556108922,
        uin: 0,
        format: 'json',
        inCharset: 'utf-8',
        outCharset: 'utf-8',
        notice: 0,
        platform: 'h5',
        needNewCode: 1,
        ct: 23,
        cv: 0,
      },
      topList: { module: 'musicToplist.ToplistInfoServer', method: 'GetAll', param: {} },
    },
  };
  return axios.get(url, {
    params,
  });
}

// 获取搜索框热门标签(移动端)
function getHotKey() {
  const url = `${ports.dev}api/getHotKey`;
  const params = {
    cgiKey: 'GetHomePage',
    _: 1573707142241,
    data: {
      comm: {
        g_tk: 556108922,
        uin: 843062905,
        format: 'json',
        inCharset: 'utf-8',
        outCharset: 'utf-8',
        notice: 0,
        platform: 'h5',
        needNewCode: 1,
      },
      MusicHallHomePage: {
        module: 'music.musicHall.MusicHallPlatform',
        method: 'MobileWebHome',
        param: { ShelfId: [101, 102, 161] },
      },
      hotkey: {
        module: 'tencent_musicsoso_hotkey.HotkeyService',
        method: 'GetHotkeyForQQMusicMobile',
        param: { remoteplace: 'txt.miniapp.wxada7aab80ba27074', searchid: '1559616839293' },
      },
    },
  };
  return axios.get(url, {
    params,
  });
}

// 搜索列表接口（移动端）
function getSearchList(query, page, perpage) {
  const url = `${ports.dev}api/getSearchList`;
  const params = {
    _: 1573718445297,
    g_tk: 556108922,
    uin: 0,
    format: 'json',
    inCharset: 'utf-8',
    outCharset: 'utf-8',
    notice: 0,
    platform: 'h5',
    needNewCode: 1,
    w: query,
    zhidaqu: 1,
    catZhida: 1,
    t: 0,
    flag: 1,
    ie: 'utf-8',
    sem: 1,
    aggr: 0,
    perpage,
    n: perpage,
    p: page,
    remoteplace: 'txt.mqq.all',
  };
  return axios.get(url, {
    params,
  });
}
const music = {
  getPicList,
  getMvList,
  getSingerList,
  getSongVkey,
  getSingerSonglist,
  getLyric,
  getDissList,
  getRank,
  getHotKey,
  getSearchList,
};

export default music;
