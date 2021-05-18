//注册elementui
import Vue  from 'vue'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);  
   
   
//注册自己定义的插件
import myPlugin from './myplugin';
Vue.use(myPlugin); 
