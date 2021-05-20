import Vue from 'vue'
import VueRouter from 'vue-router'

//使用路由插件
Vue.use(VueRouter)

const routes = [
  /* 配置页面重定向 */
  {
    path:"/",
    redirect:"/login"
  },
  {
    path:"/login",
    component:()=>import('../views/Login.vue'),
    meta:{title:"登录"}//设置当前路由的元数据
  },
  {
    name:"home",
    path:"/home",
    component:()=>import('../views/home.vue'),
    meta:{title:"首页"}//设置当前路由的元数据
  }

]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})  

//  https://b23.tv/w00mHS；https://www.bilibili.com/video/BV1xy4y1h7Ah?p=21&share_medium=iphone&share_plat=ios&share_source=WEIXIN&share_tag=s_i&timestamp=1621483496&unique_k=bEz4EU

//跳转前  from:跳转前路由，to 到哪里去的路由，
router.beforeEach((to, from, next) => {
  //获取元数据
   let {title} = to.meta
   //设置每个页面的title数据
   document.title  = title
  //如果访问登录页，放行
  if(to.path=="/login")return  next()
  //否则，判断当前用户是否登录
  const token=  sessionStorage.getItem("token");
    //如果有token，放行
    if(token){
      next()
    }else{
      //否则跳转到登录
      next("/login")
    }
})

//跳转后
router.afterEach((to, from) => {

})


export default router
