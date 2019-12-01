import jsonp from '@common/js/jsonp';

// 获取排行榜详情页歌曲列表(移动端旧的接口)
export function getTopList(topid) {
  const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_toplist_cp.fcg';
  const data = {
    topid,
    needNewCode: 1,
    uin: 0,
    tpl: 3,
    page: 'detail',
    type: 'top',
    platform: 'h5',
  };
  return jsonp(url, data, { param: 'jsonpCallback' });
}
