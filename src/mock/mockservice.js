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
      menu: "会员管理",
      index: "menber",
      submenu: [{
          name: "会员信息",
          path: "/menbermessage"
        },
        {
          name: "会员健康",
          path: "/menberhealth"
        }
      ]
    },
    {
      menu: "资金管理",
      index: "money",
      submenu: [{
          name: "充值中心",
          path: "/addmoney"
        },
        {
          name: "收银中心",
          path: "/getmoney"
        }
      ]
    },
    {
      menu: "商品管理",
      index: "product",
      submenu: [{
          name: "新品上架",
          path: "/addproduct"
        },
        {
          name: "库存管理",
          path: "/productmanager"
        }
      ]
    },
    {
      menu: "志愿者管理",
      index: "volunteer",
      submenu: [{
          name: "志愿者档案",
          path: "/volunteermessage"
        },
        {
          name: "志愿者荣誉",
          path: "/volunteerscore"
        }
      ]
    }

  ]

});