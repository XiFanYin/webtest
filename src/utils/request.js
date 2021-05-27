/* 请求工具类 */
import axios from 'axios'
/* 单独引入错误提示 */
import {
    Message
} from 'element-ui';
/* 导入全局vuex，因为是单例模式，所以可以导入*/
import store from '../store'

//定义一些需要显示全屏加载的url
let fullscreenurl = ["/login", "/menu"]
//定义一些页面处理loading的url
let customurl = []


//初始化对象
const instance = axios.create({
    baseURL: 'http://test.demo.com',
    timeout: 30000
});


/* 创建token */
let setToken = function () {
    instance.defaults.headers.common['token'] = localStorage.getItem("token");
}



// 添加请求拦截器
instance.interceptors.request.use(function (config) {
    //说明需要页面自定义处理加载
    if (customurl.indexOf(config.url) > -1) {

    }else{
    //如果需要全屏loading
    if (fullscreenurl.indexOf(config.url) > -1) {
        store.commit('setStateVal', {
            fullloading: true
        })
    } else {
        //否则就二级局部loading
        store.commit('setStateVal', {
            scopeloading: true
        })
    }
    }
    return config;
}, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
});

// 添加响应拦截器
instance.interceptors.response.use(function (response) {
    //让loading消失
    setTimeout(() => {
        store.commit('setStateVal', {
            fullloading: false
        })
        store.commit('setStateVal', {
            scopeloading: false
        })
    })
    // 对响应数据做点什么
    return response;
}, function (error) {
    //让loading消失
    setTimeout(() => {
        store.commit('setStateVal', {
            fullloading: false
        })
        store.commit('setStateVal', {
            scopeloading: false
        })
    })
    // 对响应错误做点什么
    let isHandlerError = true;
    const hideNormalError = () => isHandlerError = false
    //根据宏任务和微任务执行顺序
    setTimeout(() => {
        if (isHandlerError) {
            //统一错误处理
            Message({
                showClose: true,
                message: error,
                type: 'error'
            });
        }
    })
    //方法赋值给对象
    error.hideNormalError = hideNormalError
    return Promise.reject(error);
});



/* 定义get请求 */
let get = async function (url, params) {
    let {
        data
    } = await instance.get(url, {
        params
    })
    return data
}


/* 定义post请求 */
let post = async function (url, params) {
    let {
        data
    } = await instance.post(url, params)
    return data
}




//导出
export {
    get,
    post,
    setToken
}