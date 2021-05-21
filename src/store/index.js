import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  /* state就是数据 */
  state: {
    obj:{}
  },
  mutations: {
    setStateVal(state, obj) {
      state.obj = Object.assign({}, state.obj, obj)
    }
  }

 
})