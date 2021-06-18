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
  menudata: [{
      menu: "账号管理",
      index: "account",
      submenu: [{
          name: "角色管理",
          path: "/rolemanager"
        },
        {
          name: "账号管理",
          path: "/accountmanager"
        }
      ]
    },
    {
      menu: "客房管理",
      index: "room",
      submenu: [{
          name: "类型管理",
          path: "/roomtype"
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
        path: "/guest"
      }]
    },
    {
      menu: "权限管理",
      index: "volunteer",
      submenu: [{
        name: "权限管理",
        path: "/permission"
      }]
    }

  ]

});


//获取角色列表
Mock.mock('http://test.demo.com/gettabledata', {
  'data': [{
      roalId: "0",
      rolename: "系统管理员"
    },
    {
      roalId: "1",
      rolename: "运维"
    },
    {
      roalId: "2",
      rolename: "财务"
    },
    {
      roalId: "3",
      rolename: "测试"
    }],
});

//获取帐号列表
Mock.mock('http://test.demo.com/getaccountdata', {
  'data': [{
      id: "0",
      loginid: "zhangsan",
      name:"张三",
      phone:"15517108393",
      photo:"https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=1609307295,337975190&fm=26&gp=0.jpg",
      role:"0"
    },{
      id: "1",
      loginid: "zhangsan",
      name:"张三",
      phone:"15517108393",
      photo:"https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=1609307295,337975190&fm=26&gp=0.jpg",
      role:"0"
    },
    {
      id: "2",
      loginid: "zhangsan",
      name:"张三",
      phone:"15517108393",
      photo:"https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=1609307295,337975190&fm=26&gp=0.jpg",
      role:"0"
    },{
      id: "3",
      loginid: "zhangsan",
      name:"张三",
      phone:"15517108393",
      photo:"https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=1609307295,337975190&fm=26&gp=0.jpg",
      role:"0"
    },{
      id: "4",
      loginid: "zhangsan",
      name:"张三",
      phone:"15517108393",
      photo:"https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=1609307295,337975190&fm=26&gp=0.jpg",
      role:"0"
    },
    {
      id: "5",
      loginid: "zhangsan",
      name:"张三",
      phone:"15517108393",
      photo:"https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=1609307295,337975190&fm=26&gp=0.jpg",
      role:"0"
    },{
      id: "6",
      loginid: "zhangsan",
      name:"张三",
      phone:"15517108393",
      photo:"https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=1609307295,337975190&fm=26&gp=0.jpg",
      role:"0"
    },{
      id: "7",
      loginid: "zhangsan",
      name:"张三",
      phone:"15517108393",
      photo:"https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=1609307295,337975190&fm=26&gp=0.jpg",
      role:"0"
    },
    {
      id: "8",
      loginid: "zhangsan",
      name:"张三",
      phone:"15517108393",
      photo:"https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=1609307295,337975190&fm=26&gp=0.jpg",
      role:"0"
    },{
      id: "9",
      loginid: "zhangsan",
      name:"张三",
      phone:"15517108393",
      photo:"https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=1609307295,337975190&fm=26&gp=0.jpg",
      role:"0"
    },{
      id: "10",
      loginid: "zhangsan",
      name:"张三",
      phone:"15517108393",
      photo:"https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=1609307295,337975190&fm=26&gp=0.jpg",
      role:"0"
    },
    {
      id: "11",
      loginid: "zhangsan",
      name:"张三",
      phone:"15517108393",
      photo:"https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=1609307295,337975190&fm=26&gp=0.jpg",
      role:"0"
    },{
      id: "12",
      loginid: "zhangsan",
      name:"张三",
      phone:"15517108393",
      photo:"https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=1609307295,337975190&fm=26&gp=0.jpg",
      role:"0"
    }
    ],
});