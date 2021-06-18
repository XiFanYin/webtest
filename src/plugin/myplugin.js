import {
   get,
   post,
   setToken
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
            $post(url, params) {
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
            $showload(target = document.body, background = "rgba(255, 255, 255, 255)") {
               return this.$loading({
                  target: target,
                  'background': background,
                  spinner: 'el-icon-loading'
               })
            },
            $closeload(load) {
               // 以服务的方式调用的 Loading 需要异步关闭
               this.$nextTick(() => {
                  load.close();
               });
            }

         },
      })

   }

}