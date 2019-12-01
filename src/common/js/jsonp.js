import originJSONP from 'jsonp';
// 问号后面查询
export function queryParams(data) {
  let url = '';
  for(const k in data) {
    if (Object.hasOwnProperty.call(data, k)) {
      const value = typeof data[k] !== 'undefined' ? data[k] : '';
      url += '&' + k + '=' + encodeURIComponent(value);
    }
  }

  return url ? url.slice(1) : '';
}

export default function jsonp(url, datas, option) {
   url += url.indexOf('?') < 0 ? '?' + queryParams(datas) : queryParams(datas);
   return new Promise((resolve, reject) => {
      originJSONP(url, option, (err, data) => {
        if(!err) {
          resolve(data);
        } else {
          reject(err);
        }
      });
   });
}
