import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  /* state就是数据 */
  state: {
    //声明成对象
    obj:{}
  },
  mutations: {
    setStateVal(state, obj) {
      //https://cn.vuejs.org/v2/guide/reactivity.html#%E5%AF%B9%E4%BA%8E%E5%AF%B9%E8%B1%A1
      state.obj = Object.assign({}, state.obj, obj)
    }
  }

 
})