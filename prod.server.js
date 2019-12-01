const express = require('express');
const axios = require('axios');

const routes = express.Router();
const app = express();

// 请求处理
function getRequest(url, req, res) {
  axios.get(url, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;',
    },
    params: req.query,
  }).then((response) => {
    res.json(response.data);
  }).catch(e => console.log(e));
}

// 轮播图
routes.get('/getPicList', (req, res) => {
  // 原来api
  const url = 'https://c.y.qq.com/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg';
  getRequest(url, req, res);
});
// 歌曲列表
routes.get('/getMvList', (req, res) => {
  const url = 'https://u.y.qq.com/cgi-bin/musicu.fcg';
  getRequest(url, req, res);
});
// 歌手列表
routes.get('/getSingerList', (req, res) => {
  const url = 'https://u.y.qq.com/cgi-bin/musicu.fcg';
  getRequest(url, req, res);
});
// 当前歌手歌曲列表
routes.get('/getSingerSongs', (req, res) => {
  const url = 'https://u.y.qq.com/cgi-bin/musicu.fcg';

  getRequest(url, req, res);
});

// 获取歌曲的vkey
routes.get('/getSongVkey', (req, res) => {
  const url = 'https://u.y.qq.com/cgi-bin/musicu.fcg';
  getRequest(url, req, res);
});

// 获取歌手歌曲列表
routes.get('/getSongList', (req, res) => {
  const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_singer_track_cp.fcg';

  getRequest(url, req, res);
});

// 获取歌曲的歌词
routes.get('/getLyric', (req, res) => {
  const url = 'https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric.fcg';
  const reg = /^\w+\((\{[^()]+\})\)$/;

  axios.get(url, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;',
      referer: `https://i.y.qq.com/v8/playsong.html?songmid=${req.musicmid}&ADTAG=myqq&from=myqq&channel=10007100`,
    },
    params: req.query,
  }).then((response) => {
    let ret = response.data;
    if(typeof ret === 'string') {
      const matches = ret.match(reg);
      if(matches) {
        // 把json字符串转为JSON对象
        ret = JSON.parse(matches[1]);
      }
    }
    res.json(ret);
  }).catch(e => console.log(e));
});

// 获取歌单详情页
routes.get('/getDissList', (req, res) => {
  const url = 'https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg';
  axios.get(url, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;',
      referer: 'https://y.qq.com/',
    },
    params: req.query,
  }).then((response) => {
    res.json(response.data);
  }).catch((e) => {
    console.log(e);
  });
});

// 获取排行榜
routes.get('/getRank', (req, res) => {
  const url = 'https://u.y.qq.com/cgi-bin/musicu.fcg';

  getRequest(url, req, res);
});

// 获取搜索框热门标签
routes.get('/getHotKey', (req, res) => {
  const url = 'https://u.y.qq.com/cgi-bin/musicu.fcg';

  getRequest(url, req, res);
});

// 获取搜索列表
routes.get('/getSearchList', (req, res) => {
  const url = 'https://c.y.qq.com/soso/fcgi-bin/search_for_qq_cp';

  axios.get(url, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;',
      referer: 'https://y.qq.com/',
    },
    params: req.query,
  }).then((response) => {
    res.json(response.data);
  }).catch((e) => {
    console.log(e);
  });
});

app.use('/api', routes);
// 线上部署就不需要下面这个了
// app.use(express.static('./dist'));

const port = '9100';


module.exports = app.listen(port, (err) => {
  if(err) {
    console.log(err);
    return;
  }
  console.log('listen at  http://localhost:' + port + '\n');
});
