import {get,post,setToken} from '../utils/request'

//自定义插件
export default{
   install :function (Vue) {
    //全局混入
    Vue.mixin({
         methods: {
             $get(url,params){
                 return get(url,params)
             },
             $post(url,params){
                return post(url,params)
             },
             $setToken(token){
                setToken(token)
             }
         },
      })
    
}

}