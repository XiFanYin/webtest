import {
   get,
   post,
   setToken,
   showLoading
} from '../utils/request'


//自定义插件
export default {
   install: function (Vue) {
      //全局混入
      Vue.mixin({
         methods: {
            $get(url, params) {
               return get(url, params)
            },
            $post(url, params, loading) {
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
            $showload(target,background) {
               showLoading(target,background)
            }

         },
      })

   }

}