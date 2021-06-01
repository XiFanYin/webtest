//注册elementui
import Vue  from 'vue'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);  


//注册富文本编辑器插件
import VueQuillEditor from 'vue-quill-editor'
// require styles
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

Vue.use(VueQuillEditor)

   
   
//注册自己定义的插件
import myPlugin from './myplugin';
Vue.use(myPlugin); 
