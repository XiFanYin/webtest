import Vue from 'vue'
import VueRouter from 'vue-router'

//使用路由插件
Vue.use(VueRouter)

const routes = [
  /* 配置页面重定向 */
  {
    path: "/",
    redirect: "/home"
  },
  {
    path: "/login",
    component: () => import('../views/Login.vue'),
    meta: {
      title: "登录"
    } //设置当前路由的元数据
  },
  {
    name: "home",
    path: "/home",
    component: () => import('../views/home.vue'),
    meta: {
      title: "首页"
    }, //设置当前路由的元数据
    children: [{
        name: "homedefault",
        path: "/",
        component: () => import('../views/homedefault.vue'),
        meta: {
          title: "首页"
        }
      },
      {
        name: "menbermessage",
        path: "/menbermessage",
        component: () => import('../views/menbermessage.vue'),
        meta: {
          title: "会员信息"
        }
      },
      {
        name: "menberhealth",
        path: "/menberhealth",
        component: () => import('../views/menberhealth.vue'),
        meta: {
          title: "会员健康"
        }
      }
    ]
  }

]



const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})


//在router.js文件加入，解决element问题可以完美的解决
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}



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
})

//跳转后
router.afterEach((to, from) => {

})


export default router