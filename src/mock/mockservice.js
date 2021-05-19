// 首先引入Mock
import Mock from 'mockjs'

// 设置拦截ajax请求的相应时间
Mock.setup({
  timeout: '200-600'
});

Mock.mock('http://test.demo.com/login', { 
     'token': 'abcdefg', 
    
});

