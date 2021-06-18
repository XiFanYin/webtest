import Vue from 'vue'
import VueRouter from 'vue-router'
//因为Vuex是单例模式，可以在任何页面导入并使用
import store from '../store'

//使用路由插件
Vue.use(VueRouter)


//在router.js文件加入，解决element问题可以完美的解决
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}



const routes = [
  /* 配置页面重定向 */
  {
    path: "/",
    redirect: "/home"
  },
  {
    path: "/login",
    component: () => import('../views/login/Login.vue'),
    meta: {
      title: "登录"
    } //设置当前路由的元数据
  },
  {
    name: "home",
    path: "/home",
    component: () => import('../views/home/home.vue'),
    redirect: "/homedefault",
    meta: {
      title: "首页"
    }, //设置当前路由的元数据
    children: [{
        name: "homedefault",
        path: "/homedefault",
        component: () => import('../views/home/homedefault.vue'),
        meta: {
          title: "首页"
        }
      }, {
        name: "mine",
        path: "/mine",
        component: () => import('../views/user/mine.vue'),
        meta: {
          title: "个人中心",
          permission:[1]
        }
      }, {
        name: "resetpwd",
        path: "/resetpwd",
        component: () => import('../views/user/resetpwd.vue'),
        meta: {
          title: "修改密码"
        }
      },
      {
        name: "rolemanager",
        path: "/rolemanager",
        component: () => import('../views/account/rolemanager.vue'),
        meta: {
          title: "角色管理"
        }
      },
      {
        name: "accountmanager",
        path: "/accountmanager",
        component: () => import('../views/account/accountmanager.vue'),
        meta: {
          title: "账号管理"
        }
      },
      {
        name: "roomtype",
        path: "/roomtype",
        component: () => import('../views/room/roomtype.vue'),
        meta: {
          title: "房间管理"
        }
      },
      {
        name: "guest",
        path: "/guest",
        component: () => import('../views/guest/guest.vue'),
        meta: {
          title: "客户管理"
        }
      },
      {
        name: "permission",
        path: "/permission",
        component: () => import('../views/permission/permission.vue'),
        meta: {
          title: "权限管理",
          keepAlive:true
        }
      }
    ]
  },
  /* 没有匹配到任何页面，就跳转到404页面 */
  {
    name: "404",
    path: "*",
    component: () => import('../views/error/404.vue'),
    meta: {
      title: "你所访问的页面不存在"
    }
  }

]



const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})




//跳转前  from:跳转前路由，to 到哪里去的路由，
router.beforeEach((to, from, next) => {
  //获取元数据
  let {
    title
  } = to.meta
  //设置每个页面的title数据
  document.title = title
  //如果访问登录页，放行
  if (to.path == "/login") return next()
  //否则，判断当前用户是否登录
  const token = localStorage.getItem("token");
  //如果有token，放行
  if (token) {
    next()
  } else {
    //否则跳转到登录
    next("/login")
  }
  //这里可以做判断当前登录人角色id是否能跳转这个页面，能跳转就跳转，不能跳转就回到首页
})

//跳转后
router.afterEach((to, from) => {

})


export default router