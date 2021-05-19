/* 请求工具类 */
import axios from 'axios'

//初始化对象
const instance = axios.create({
    baseURL: 'http://test.demo.com',
    timeout: 30000
});


/* 创建token */
let  setToken = function () {
    instance.defaults.headers.common['token'] = sessionStorage.getItem("token");  
}



// 添加请求拦截器
instance.interceptors.request.use(function (config) {
    // 在发送请求之前做些什么
    return config;
}, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
});

// 添加响应拦截器
instance.interceptors.response.use(function (response) {
    // 对响应数据做点什么
    return response;
}, function (error) {
    // 对响应错误做点什么
    return Promise.reject(error);
});


/* 定义get请求 */
let get = async function (url, params) {
   let {data} =  await instance.get(url, {params})
   return data
}


/* 定义post请求 */
let post = async function (url, params) {
    let {data} = await instance.post(url, params)
    return data
}

//导出
export {
    get,
    post,
    setToken
}