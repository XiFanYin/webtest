<template>
  <div class="root">
    <div  class="rootson" >
    <img src="../assets/404.png" alt="" />
     <p class="tip">你所访问的页面不存在！</p> 
     <p>资源不存在或者没有访问权限，<router-link to="/">点击这里</router-link>返回首页</p> 
 
    </div>

  </div>
</template>
<script>
export default {};
</script>

<style lang="scss" scoped>
.root {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  .rootson{
    margin: auto;
    .tip{
        text-align: center;
        margin-bottom: 10px;
        font-weight: bold;
    }
}
}



</style>