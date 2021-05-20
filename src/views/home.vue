<template>
  <div class="home">
    <div class="lift">
      <div class="logo">欢迎光临</div>

      <el-menu
        unique-opened
        class="el-menu-vertical-demo mymenu"
        background-color="#545c64"
        text-color="#fff"
        @select="selecet"
        active-text-color="#ffd04b"
      >
        <!-- 循环遍历菜单数据 -->
        <el-submenu
          v-for="(item, index) in menudata"
          :key="index"
          :index="item.index"
        >
          <!-- 插槽标题title -->
          <template slot="title">
            <i class="el-icon-location"></i>
            <span>{{ item.menu }}</span>
          </template>
          <!-- 循环遍历子标题 -->
          <el-menu-item
            v-for="(submenu, subindex) in item.submenu"
            :key="subindex"
            :index="submenu.path"
            >{{ submenu.name }}</el-menu-item
          >
        </el-submenu>
      </el-menu>
    </div>

    <div class="right">
       <div class="nav_bar"></div>
       <router-view/>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      //菜单数据
      menudata: [],
    };
  },

  methods: {
    //某个条目被点击
    selecet(index) {
     this.$router.push(index)
    },
  },
  mounted() {
    //请求菜单
    this.$get("/menu").then((res) => {
      this.menudata = res.menudata;
    });
  },
};
</script>

<style lang="scss" scoped>


.home {
  width: 100%;
  height: 100vh;
  display: flex;
  .lift {
    width: 200px;
    .logo {
      width: 100%;
      height: 100px;
      background-color: darkcyan;
      text-align: center;
      color: #ffffff;
      line-height: 100px;
      font-size: 36px;
    }

    .mymenu {
      height: 100%;
      border: none; /* element有这个属性，给他干掉 */
    }
  }
  .right {
    flex: 1;
    border: 1px solid #000;
    .nav_bar{
      width: 100%;
      height: 70px;
      background: #545c64;
    }

  }

  /* 修改ui库样式 */
 /*  ::v-deep .el-icon-arrow-down:before {
    content: "";
  } */

  
}
</style>