// export const singer = state => state.singer;
// export const mv = state => state.singer;
export const currentSong = state => state.playList[state.currentIndex] || {};
