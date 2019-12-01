function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// 随机排序(洗牌)
export function shuffle(arr) {
  // 不能深拷贝，因为arr中每个元素都是 类Song的实例，里面有getSongLyric实例方法(获取歌词)
  // 如果用JSON深拷贝，会把实例的函数方法 去掉，所以要用slice方法浅拷贝
  // const list = JSON.parse(JSON.stringify(arr));
  const list = arr.slice();
  // 当前值跟 随机值交换
  for(let i = 0; i < list.length; i++) {
    const j = getRandomNumber(0, i);
    // 交换
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

// 防抖(用于input输入)
export function debounce(fn, delay) {
  let timer = null;
  return function f(...args) {
    const context = this;
    if(timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn.apply(context, args);
    }, delay);
  };
}
