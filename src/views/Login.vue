<template>
  <div class="login_main">

    <div class="logo">
      <img src="../assets/logo.png" alt="" />
    </div>

    <div class="loginfrom">
      <!-- 需要配置module数据和校验数据对象，并设置ref，为下边获取dom做准备-->
      <el-form :model="logindata" :rules="loginrules"  ref="formelement" label-width="50px" class="demo-ruleForm" >
       <!-- prop 指向的是校验数据的key -->
        <el-form-item label="帐号" prop="loginname">
          <!-- 绑定数据对象 -->
          <el-input v-model="logindata.loginname" autocomplete="off"></el-input>
        </el-form-item>

      <el-form-item label="密码" prop="loginpwd">
         <el-input v-model="logindata.loginpwd" autocomplete="off"  type="password"></el-input>
       </el-form-item>

      <el-form-item>
         <el-checkbox v-model="logindata.checked">记住密码</el-checkbox>
       </el-form-item>

        <el-form-item class="btnfather" label-width="0px">
          <!-- 调用提交方法，并传递ref字符串 -->
          <el-button class="btn" type="primary"   @click="submitForm('formelement')" >提交</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    //验证用户名方法
    var validateUsername = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入帐号"));
      } else {
        callback();
      }
    };

    //验证密码方法
    var validatepwd = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入密码"));
      } else {
        callback();
      }
    };

    return {
      //表单数据
      logindata: {
        loginname: "",
        loginpwd:"",
        checked:false
      },
      //表单验证数据
      loginrules: {
        //验证用户名，key必须和表单数据key一致，失去焦点时机去验证
        loginname: [{ validator: validateUsername, trigger: "blur" }],
        loginpwd: [{ validator: validatepwd, trigger: "blur" }],
      },
    };
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          //发起网络请求
          this.$get("/login1").then(res => {
               //保存token
              localStorage.setItem("token",res.token)
              //给网络请求设置token
              this.$setToken()
             // 保存用户登录名
             localStorage.setItem("loginname",this.logindata.loginname)
             if(this.logindata.checked){
                 localStorage.setItem("loginpwd",this.logindata.loginpwd)
             }else{
                localStorage.setItem("loginpwd","")
             }
             //跳转页面
            this.$router.push({ path: '/home'});
           }).catch(error=>{
             //隐藏全局错误处理，当前页面去处理
             error.hideNormalError()
           })
        } else {
          return false;
        }
      });
    },
  },
  mounted() {
    this.logindata.loginname =  localStorage.getItem("loginname")
    this.logindata.loginpwd = localStorage.getItem("loginpwd")
    if(this.logindata.loginpwd){
      this.logindata.checked = true
    }
  },


};
</script>

<style lang="scss" scoped>
.login_main {
  background-image: url(../assets/login_bg.jpg);
  height: 100vh;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  -moz-background-size: 100% 100%;
  position: relative;

  .logo {
    position: absolute;
    top: 30%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .loginfrom {
    padding: 20px;
    width: 400px;
    height: 240px;
    position: absolute;
    top: 66%;
    left: 50%;
    transform: translate(-50%, -50%);
    border: 1px solid #eeeeee;
    border-radius: 10px;
  }
  .btnfather{
     text-align: center;
     .btn{
        width: 340px;
     }
  
  }
}
</style>