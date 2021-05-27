import {
   get,
   post,
   setToken
} from '../utils/request'
/* 导入全局vuex，因为是单例模式，所以可以导入*/
import store from '../store'
//自定义插件
export default {
   install: function (Vue) {
      //全局混入
      Vue.mixin({
         methods: {
            $get(url, params) {
               return get(url, params)
            },
            $post(url, params,loading) {
               return post(url, params)
            },
            $setToken() {
               setToken()
            },
            $con_f(message, success) {
               this.$confirm(message)
                  .then(_ => {
                     success()
                  })
                  .catch(_ => {});
            },
            $showfullscreenloading(){
               store.commit('setfullscreenloading', true)
            },
            $showscopescreenloading(){
               store.commit('setscopescreenloading', true)
            }

         },
      })

   }

}