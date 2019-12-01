export default class Singer {
  constructor({ id, mid, name }) {
    this.id = id;
    this.mid = mid;
    this.name = name;
    // 不用原图片是因为太小了，放大模糊
    this.picUrl = `https://y.gtimg.cn/music/photo_new/T001R300x300M000${mid}.jpg?max_age=2592000`;
  }
}
