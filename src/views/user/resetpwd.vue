<template>
  <div class="pass">
    <el-form
      :model="pass"
      status-icon
      :rules="rules"
      ref="ruleForm"
      label-width="100px"
      class="demo-ruleForm"
    >
      <el-form-item label="原密码" prop="oldpass">
        <el-input
          show-password
          type="password"
          v-model="pass.oldpass"
        ></el-input>
      </el-form-item>
      <el-form-item label="新密码" prop="newonepass">
        <el-input
          type="password"
          show-password
          v-model="pass.newonepass"
        ></el-input>
      </el-form-item>

      <el-form-item label="确认密码" prop="newtwopass">
        <el-input
          type="password"
          show-password
          v-model="pass.newtwopass"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm('ruleForm')"
          >提交</el-button
        >
      </el-form-item>
    </el-form>
    <div class="empty"></div>
  </div>
</template>
<script>
export default {
  data() {
    var validateonepwd = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入新密码"));
      } else {
        if (this.pass.newtwopass !== "") {
          //手动验证某个属性
          this.$refs.ruleForm.validateField("newtwopass");
        }
        callback();
      }
    };
    var validatetwopwd = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请再次输入密码"));
      } else if (value !== this.pass.newonepass) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    };

    return {
      pass: {
        oldpass: "",
        newonepass: "",
        newtwopass: "",
      },
      rules: {
        oldpass: [
          { required: true, message: "原密码不能为空", trigger: "blur" },
        ],
        newonepass: [
          { required: true, validator: validateonepwd, trigger: "blur" },
        ],
        newtwopass: [
          { required: true, validator: validatetwopwd, trigger: "blur" },
        ],
      },
    };
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          alert("submit!");
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.pass {
  display: flex;
  height: 100%;
}
.el-form {
  flex: 1;
  margin-top: 40px;
}
.empty {
  flex: 1;
}
</style>