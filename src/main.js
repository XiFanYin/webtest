import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

//引入公共样式
import './commom/index.css'
//加载插件
import './plugin/index.js'


//模拟数据运行
import './mock/mockservice.js'

 new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')


