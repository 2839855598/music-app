import Vue from 'vue';
import VueRouter from 'vue-router';
// import Rank from '@components/rank/rank';
// import Recommend from '@components/recommend/recommend';
// import Search from '@components/search/search';
// import Singer from '@components/singer/singer';
// import SingerDetail from '@components/singer-detail/singer-detail';
// import DissDetail from '@components/diss-detail/diss-detail';
// import TopList from '@components/top-list/top-list';
// import UserCenter from '@components/user-center/user-center';

// 路由懒加载
const Rank = () => import(/* webpackChunkName: "rank" */'@components/rank/rank');
const Recommend = () => import(/* webpackChunkName: "recommend" */ '@components/recommend/recommend');
const Search = () => import(/* webpackChunkName: "search" */ '@components/search/search');
const Singer = () => import(/* webpackChunkName: "singer" */ '@components/singer/singer');
const SingerDetail = () => import(/* webpackChunkName: "singer-detail" */ '@components/singer-detail/singer-detail');
const DissDetail = () => import(/* webpackChunkName: "DissDetail" */ '@components/diss-detail/diss-detail');
const TopList = () => import(/* webpackChunkName: "TopList" */ '@components/top-list/top-list');
const UserCenter = () => import(/* webpackChunkName: "UserCenter" */ '@components/user-center/user-center');


Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    redirect: '/recommend',
  },
  {
    path: '/recommend',
    name: 'recommend',
    component: Recommend,
    children: [
      {
        path: ':id',
        name: 'dissDetail',
        component: DissDetail,
      },
    ],
  },
  {
    path: '/singer',
    name: 'singer',
    component: Singer,
    children: [
      {
        path: ':mid',
        name: 'singer-detail',
        component: SingerDetail,
      },
    ],
  },
  {
    path: '/search',
    name: 'search',
    component: Search,
    children: [
      {
        path: ':mid',
        component: SingerDetail,
      },
    ],
  },
  {
    path: '/rank',
    name: 'rank',
    component: Rank,
    children: [
      {
        path: ':id',
        name: 'top-list',
        component: TopList,
      },
    ],
  },
  {
    path: '/user',
    name: 'user',
    component: UserCenter,
  },
  {
    path: '*',
    redirect: '/',
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.NODE_ENV === 'production' ? '/music/' : '/',
  routes,
});

export default router;
