// 首先引入Mock
import Mock from 'mockjs'

// 设置拦截ajax请求的相应时间
Mock.setup({
  timeout: '200-600'
});

//登录接口
Mock.mock('http://test.demo.com/login', {
  'token': 'abcdefg',
});

//请求左侧菜单接口
Mock.mock('http://test.demo.com/menu', {
   menudata:  [{
      menu: "账号管理",
      index: "account",
      submenu: [{
          name: "角色管理",
          path: "/rolemanager"
        },
        {
          name: "账号管理",
          path: "/menberhealth"
        }
      ]
    },
    {
      menu: "客房管理",
      index: "money",
      submenu: [{
          name: "类型管理",
          path: "/addmoney"
        },
        {
          name: "客房管理",
          path: "/getmoney"
        }
      ]
    },
    {
      menu: "客户管理",
      index: "product",
      submenu: [{
          name: "客户管理",
          path: "/addproduct"
        }
      ]
    },
    {
      menu: "权限管理",
      index: "volunteer",
      submenu: [{
          name: "权限管理",
          path: "/volunteermessage"
        }
      ]
    }

  ]

});