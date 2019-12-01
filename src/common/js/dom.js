// 获取/设置dom的data-开头的属性
export default function getDomProper(el, key, val) {
  // 存在的话，就set
  if(typeof val !== 'undefined') {
    el.dataset[key] = val;
  }
  // 不存在, 就get
  return el.dataset[key];
}
const eleStyle = document.createElement('div').style;
const vendor = (() => {
  const transNames = {
    standard: 'transform',
    webkit: 'webkitTransform',
    Moz: 'MozTransform',
    ms: 'msTransform',
    O: 'OTransform',
  };
  for(const key in transNames) {
    if(typeof eleStyle[transNames[key]] !== 'undefined') {
      return key;
    }
  }
  return false;
})();


export function prefix(attr) {
  if(vendor === false) {
    return false;
  }
  if(vendor === 'standard') {
    return attr;
  }
  return vendor + attr.charAt(0).toUpperCase() + attr.slice(1);
}
