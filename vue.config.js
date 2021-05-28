module.exports = {
    lintOnSave: false,
    // devServer: {
    //     proxy: {  //配置跨域
    //       '/api': {
    //         target: 'http://192.168.1.136:80',  //这里后台的地址模拟的;应该填写你们真实的后台接口
    //         changOrigin: true,  //允许跨域
    //         pathRewrite: {
    //           '^/api': '' 
    //         }
    //       },
    //     }
    //   },


      devServer: {
        host: '0.0.0.0',
        port: port,
        open: true,
        proxy: {
          '/api': {
            target: `http://192.168.1.136:80` ,
            changeOrigin: true,
            pathRewrite: {
              '^/api': ''
            }
          }
        },
    }

}