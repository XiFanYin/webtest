import Vue from 'vue'
import Vuex from 'vuex'

import createPersistedState from "vuex-persistedstate"

Vue.use(Vuex)

export default new Vuex.Store({
  /* state就是数据 */
  state: {
    //声明成对象，里边放动态数据
    obj: {},
    //主题数据,默认数据
    theme: [{
        name: "默认灰",
        value: "#545c64"
      },
      {
        name: "天空蓝",
        value: "#101f30"
      },
      {
        name: "中国红",
        value: "#7c1823"
      },
    ]
  },
  mutations: {
    setStateVal(state, obj) {
      //https://cn.vuejs.org/v2/guide/reactivity.html#%E5%AF%B9%E4%BA%8E%E5%AF%B9%E8%B1%A1
      state.obj = Object.assign({}, state.obj, obj)
    }
  },
  //配置插件解决刷新数据不消失
  plugins: [createPersistedState({
    storage: window.sessionStorage
  })]

})