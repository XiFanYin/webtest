// 首先引入Mock
import Mock from 'mockjs'

// 设置拦截ajax请求的相应时间
Mock.setup({
  timeout: '200-600'
});

Mock.mock('http://test.demo.com/login', { //输出数据
     'name': '@name', //随机生成姓名
    //还可以自定义其他数据
});

