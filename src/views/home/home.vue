<template>
  <div class="home">
    <div class="lift">
      <div class="logo" :style="{ background: themeColor }">
        <span>欢迎光临</span>
      </div>
      <el-menu
        :default-active="$route.path"
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
            <img src="@/assets/logo.png" class="icon" />
            <span>{{ item.menu }}</span>
          </template>
          <!-- 循环遍历子标题 -->
          <el-menu-item
            v-for="(submenu, subindex) in item.submenu"
            :key="subindex"
            :index="submenu.path"
            ><span>{{ submenu.name }}</span></el-menu-item
          >
        </el-submenu>
      </el-menu>
    </div>

    <div class="right">
      <!-- title -->
      <div class="nav_bar" :style="{ background: themeColor }">
        <i class="el-icon-s-home homeicon" @click="goHomedefult"></i>
        <div style="flex: 1"></div>

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

        <div class="user">
          <el-dropdown trigger="click">
            <div class="el-dropdown-link">
              <img src="@/assets/userpic.jpg" class="picture avatar" />
            </div>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item @click.native="tomine"
                >个人中心</el-dropdown-item
              >
              <el-dropdown-item @click.native="toresetpwd"
                >修改密码</el-dropdown-item
              >
              <el-dropdown-item @click.native="loginOut()"
                >退出登录</el-dropdown-item
              >
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
      <keep-alive>
        <router-view v-if="$route.meta.keepAlive" class="right_view" />
      </keep-alive>
      <router-view v-if="!$route.meta.keepAlive" class="right_view" />
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
      themeColor: localStorage.getItem("themecolor") || "#545c64",
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
      //保存主题颜色
      localStorage.setItem("themecolor", themeItem.value);
    },
    //退出登录
    loginOut() {
      //清空token
      localStorage.setItem("token", "");
      //跳转到登录页面
      this.$router.replace("/login");
    },
    //跳转到大屏显示
    goHomedefult() {
      if (this.$route.path != "/homedefault") {
        this.$router.replace("/homedefault");
      }
    },
    //跳转到个人中心
    tomine() {
      this.$router.push("/mine");
    },
    //跳转到修改密码
    toresetpwd() {
      this.$router.push("/resetpwd");
    },
  },
  mounted() {
    //请求菜单
    var loading = this.$showload();
    this.$get("/menu")
      .then((res) => {
        this.menudata = res.menudata;
        this.$closeload(loading);
      })
      .catch((error) => {
        //隐藏全局错误处理，当前页面去处理
        //  error.hideNormalError()
        this.$closeload(load);
      });
  },
};
</script>

<style lang="scss" scoped>
.home {
  width: 100%;
  height: 100%;
  display: flex;
  .lift {
    height: 100%;
    width: 200px;
    min-width: 200px;
    overflow: hidden;
    .logo {
      height: 70px;
      text-align: center;
      color: #ffffff;
      line-height: 70px;
      font-size: 22px;
      span {
        border: solid 1px #eeeeee;
        padding: 5px;
      }
    }

    .mymenu {
      height: calc(100vh - 70px);
      overflow-y: scroll;
      width: 220px;
      min-width: 220px;
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
      .homeicon {
        font-size: 26px;
        color: #ffffff;
        line-height: 70px;
        padding-left: 10px;
      }

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
            width: 36px;
            height: 36px;
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

.right_view {
  margin: 10px;
  height: calc(100vh - 90px);
  background: #ffffff;
}
.avatar:hover {
    transform: rotate(666turn);
    transition-delay: 1s;
    transition-property: all;
    transition-duration: 59s;
    transition-timing-function: cubic-bezier(.34,0,.84,1);
}


</style>