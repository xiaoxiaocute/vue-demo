import Vue from "vue";
import VueRouter from "vue-router";
import Login from "./components/Login.vue";
import Home from "./components/Home.vue";
import Welcome from "./components/Welcome.vue";
import Users from "./components/users/Users.vue";
import Rights from "./components/power/Rights.vue";
import Roles from "./components/power/Roles.vue";
import Params from "./components/goods/Params.vue";
import Reports from "./components/report/Reports.vue";
import Categories from "./components/goods/Categories.vue";
import Axios from "axios";

Vue.use(VueRouter);
const routes = [{
    path: "/",
    redirect: "/login"
  },
  {
    path: "/login",
    component: Login
  },
  {
    path: "/home",
    component: Home,
    redirect: '/welcome',
    children: [{
        path: "/welcome",
        component: Welcome
      },
      {
        path: "/users",
        component: Users
      },
      {
        path: "/rights",
        component: Rights
      },
      {
        path: "/roles",
        component: Roles
      },
      {
        path: "/categories",
        component: Categories
      },
      {
        path: "/params",
        component: Params
      },
      {
        path: "/reports",
        component: Reports
      }
    ]
  }
];
const router = new VueRouter({
  routes
});
// 在挂载之前设置拦截器
Axios.interceptors.request.use(config => {
  // 为config做一下预处理
  config.headers.Authorization = window.sessionStorage.getItem('token');
  return config;
});
// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to: 将要访问的路径
  // from 从哪一个路径跳转而来
  // next放行
  if (to.path === "/login") {
    return next();
  }
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token');
  if (!tokenStr) {
    return next('/login');
  }
  next();
});
export default router;
