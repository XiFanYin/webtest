<template>
  <div class="home">
    <div class="lift">
      <div class="logo">欢迎光临</div>

      <el-menu
        unique-opened
        class="el-menu-vertical-demo mymenu"
        :background-color="themeColor"
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
            <img src="../assets/logo.png" class="icon" />
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
      <!-- title -->
      <div class="nav_bar">
        <div class="user">
          <el-dropdown trigger="click">
            <div class="el-dropdown-link">
              <img src="../assets/userpic.jpg" class="picture" />
            </div>
            <el-dropdown-menu slot="dropdown">
                <el-dropdown-item>个人中心</el-dropdown-item>
                 <el-dropdown-item>修改密码</el-dropdown-item>
              <el-dropdown-item @click.native="loginOut()">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>

        <div class="theme">
          <el-dropdown trigger="click">
            <span class="el-dropdown-link">
              主题<i class="el-icon-arrow-down el-icon--right"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item
                v-for="(themeitem, index) in $store.state.theme"
                :key="index"
                @click.native="changeTheme(themeitem)"
                >{{ themeitem.name }}</el-dropdown-item
              >
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>

      <router-view />
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      //菜单数据
      menudata: [],
      //主题颜色默认值
      themeColor: "#545c64",
    };
  },

  methods: {
    //左导航点击
    selecet(index) {
      this.$router.push(index);
    },
    //切换主题点击
    changeTheme(themeItem) {
      this.themeColor = themeItem.value;
      //改变scss定义的变量值
      document
        .getElementsByTagName("body")[0]
        .style.setProperty("--theme-color", this.themeColor);
    },
    //退出登录
    loginOut(){
       //清空token
        localStorage.setItem("token","")
        //跳转到登录页面
        this.$router.replace("/login")
    }
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
//定义css变量，--theme-color,为js操作此变量需要用到的KEY
$themeColor: var(--theme-color, #545c64);

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
      .icon {
        width: 16px;
        height: 16px;
        padding-right: 5px;
      }
    }
  }
  .right {
    flex: 1;
    .nav_bar {
      width: 100%;
      height: 70px;
      display: flex;
      flex-direction: row-reverse;
      //引用变量
      background: $themeColor;
      //
      .user {
        margin-right: 50px;
        height: 70px;
    
        .el-dropdown-link {
          color: #ffffff;
          font-size: 18px;
           height: 70px;
           display: flex;
           align-items: center;
          .picture {
            width: 30px;
            height: 30px;
            display: inline-block;
            border-radius: 50%;
          }
        }
      }

      .theme {
        margin-right: 30px;
        .el-dropdown-link {
          cursor: pointer;
          color: #ffffff;
          font-size: 18px;
          line-height: 70px;
        }
        .el-icon-arrow-down {
          font-size: 12px;
        }
      }
    }
  }

  /* 修改ui库样式 */
  /* ::v-deep .el-icon-arrow-down:before {
    content: "";
  } */
}

.el-dropdown-menu {
  top: 42px !important;
}
</style>