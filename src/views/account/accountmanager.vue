<template>
  <div ref="account">
    <div class="search">
      <el-select v-model="value" placeholder="请选择" clearable>
        <el-option
          v-for="item in cities"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
          <span style="float: left">{{ item.label }}</span>
          <span style="float: right; color: #8492a6; font-size: 13px">{{
            item.value
          }}</span>
        </el-option>
      </el-select>

      <el-button type="success" @click="excel">导出Excel</el-button>
      <el-button type="primary" @click="addrole">添加帐号</el-button>
    </div>

    <el-table
      height="calc(100vh - 146px)"
      :data="tableData"
      style="width: 99.6%"
      stripe
      border
      :header-cell-style="{ textAlign: 'center' }"
      :cell-style="{ textAlign: 'center' }"
    >
      <el-table-column label="编号" min-width="1">
        <template slot-scope="scope">
          <span style="margin-left: 10px">{{ scope.row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column label="帐号" min-width="2">
        <template slot-scope="scope">
          <span style="margin-left: 10px">{{ scope.row.loginid }}</span>
        </template>
      </el-table-column>

      <el-table-column label="姓名" min-width="2">
        <template slot-scope="scope">
          <span style="margin-left: 10px">{{ scope.row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column label="电话" min-width="2">
        <template slot-scope="scope">
          <span style="margin-left: 10px">{{ scope.row.phone }}</span>
        </template>
      </el-table-column>

      <el-table-column label="头像" min-width="2">
        <template slot-scope="scope">
          <el-image :src="scope.row.photo" fit="cover"></el-image>
        </template>
      </el-table-column>

      <el-table-column label="角色" min-width="2">
        <template slot-scope="scope">
          <span style="margin-left: 10px">{{ scope.row.role }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="180px">
        <template slot-scope="scope">
          <el-button size="mini" @click="handleEdit(scope.$index, scope.row)"
            >编辑</el-button
          >
          <el-button
            size="mini"
            type="danger"
            @click="handleDelete(scope.$index, scope.row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <el-drawer
      :title="isadd ? '添加帐号' : '修改帐号'"
      :visible.sync="drawer"
      :direction="direction"
      @close="drawerClose"
    >
      <!-- 需要配置module数据和校验数据对象，并设置ref，为下边获取dom做准备-->
      <el-form
        :model="userdata"
        :rules="rolerules"
        ref="formelement"
        label-width="100px"
        class="demo-ruleForm"
      >
        <!-- prop 指向的是校验数据的key -->
        <el-form-item label="头像" prop="photo">
          <el-upload
            class="avatar-uploader"
            action="http://192.168.1.136/system/upload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="userdata.photo" :src="userdata.photo" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>

        <el-form-item label="帐号" prop="loginid">
          <!-- 绑定数据对象 -->
          <el-input v-model="userdata.loginid" autocomplete="off"></el-input>
        </el-form-item>

        <el-form-item label="密码" prop="loginPwd">
          <!-- 绑定数据对象 -->
          <el-input show-password v-model="userdata.loginPwd"></el-input>
        </el-form-item>

        <el-form-item label="确认密码" prop="loginPwd2">
          <!-- 绑定数据对象 -->
          <el-input show-password v-model="userdata.loginPwd2"></el-input>
        </el-form-item>

        <el-form-item label="姓名" prop="name">
          <!-- 绑定数据对象 -->
          <el-input v-model="userdata.name" autocomplete="off"></el-input>
        </el-form-item>

        <el-form-item label="电话" prop="phone">
          <!-- 绑定数据对象 -->
          <el-input v-model="userdata.phone" autocomplete="off"></el-input>
        </el-form-item>

        <el-form-item label="角色" prop="role">
          <!-- 绑定数据对象 -->
          <el-select v-model="userdata.role" clearable placeholder="请选择角色">
            <el-option
              v-for="item in roledata"
              :key="item.roalId"
              :label="item.rolename"
              :value="item.roalId"
            >
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item class="btnfather" label-width="100px">
          <!-- 调用提交方法，并传递ref字符串 -->
          <el-button
            class="btn"
            type="primary"
            @click="submitForm('formelement')"
            >提交</el-button
          >
        </el-form-item>
      </el-form>
    </el-drawer>
  </div>
</template>
<script>
import { xlsx } from "../../utils/xlsx";
export default {
  mounted() {
    //获取表格数据
    this.gettabledata();
    //获取角色数据
    this.getroledata();
  },
  data() {
    //验证数据数据不能为空
    var validaterolepwd = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入密码"));
      } else {
        if (this.userdata.loginPwd2 !== "") {
          //手动验证某个属性
          this.$refs.formelement.validateField("loginPwd2");
        }
        callback();
      }
    };
    var validatepwd2 = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请再次输入密码"));
      } else if (value !== this.userdata.loginPwd) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    };
    return {
      cities: [
        {
          value: "Beijing",
          label: "北京",
        },
        {
          value: "Shanghai",
          label: "上海",
        },
        {
          value: "Nanjing",
          label: "南京",
        },
        {
          value: "Chengdu",
          label: "成都",
        },
        {
          value: "Shenzhen",
          label: "深圳",
        },
        {
          value: "Guangzhou",
          label: "广州",
        },
      ],
      value: "",
      //抽屉开关
      drawer: false,
      direction: "rtl",
      //页面列表数据
      tableData: [],
      //获取角色列表
      roledata: [],
      //添加角色数据
      userdata: {
        loginid: "",
        photo: "",
        name: "",
        phone: "",
        role: "",
        loginPwd: "",
        loginPwd2: "",
      },
      isadd: true,
      //表单验证数据
      rolerules: {
        //验证用户名，key必须和表单数据key一致，失去焦点时机去验证
        loginid: [{ required: true, message: "请输入帐号", trigger: "blur" }],
        name: [{ required: true, message: "请输入姓名", trigger: "blur" }],
        phone: [{ required: true, message: "请输入电话", trigger: "blur" }],
        role: [{ required: true, message: "请选择角色", trigger: "change" }],
        loginPwd: [
          { required: true, validator: validaterolepwd, trigger: "blur" },
        ],
        loginPwd2: [
          { required: true, validator: validatepwd2, trigger: "blur" },
        ],
      },
    };
  },
  methods: {
    //获取角色数据
    getroledata() {
      this.$get("/gettabledata").then((res) => {
        this.roledata = res.data;
      });
    },
    //获取table数据
    gettabledata() {
      var load = this.$showload(this.$refs.account);
      this.$get("/getaccountdata")
        .then((res) => {
          this.tableData = res.data;
          this.$closeload(loading);
        })
        .catch((error) => {
          //隐藏全局错误处理，当前页面去处理
          //  error.hideNormalError()
          this.$closeload(load);
        });
    },
    //处理编辑
    handleEdit(index, row) {
      this.isadd = false;
      this.drawer = true;
      //数据回显,这里不能赋值对象，要深拷贝
      Object.keys(row).forEach((key) => {
        this.userdata[key] = row[key];
      });
    },
    //处理删除用户
    handleDelete(index, row) {
      this.$con_f(`确定删除  ${row.name}  用户吗？`, () => {
        this.gettabledata();
      });
      //获取角色id
      //请求删除，删除当前角色，请求列表数据
    },
    //关闭抽屉
    drawerClose() {
      //清空表单
      this.$refs.formelement.resetFields();
      //恢复初始值,饿了吗框架问题，清空表单，数据不会清空
      this.userdata = this.$options.data().userdata;
    },
    //点击添加帐号
    addrole() {
      this.isadd = true;
      this.drawer = true;
    },
    //导出Excel
    excel() {
      let json = this.tableData.map((r) => {
        return {
          account: r.id,
          loginid: r.loginid,
          name: r.name,
          phone: r.phone,
        };
      });
      let fields = {
        account: "用户编号",
        loginid: "登录名",
        name: "姓名",
        phone: "手机号",
      };

      let filename = "系统帐号统计表";
      xlsx(json, fields, filename);
    },

    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          if (this.isadd) {
            //这里请求添加接口
          } else {
            //这里请求修改接口
          }
          // 关闭弹窗
          this.drawer = false;
          //再次请求用户数据
          this.gettabledata();
        } else {
          return false;
        }
      });
    },
    //上传成功返回上传地址
    handleAvatarSuccess(res, file) {
      this.userdata.photo = URL.createObjectURL(file.raw);
    },

    //上传之前调用
    beforeAvatarUpload(file) {
      let img_type = ["image/jpeg", "image/png", "image/gif"];
      const isJPG = img_type.includes(file.type);
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error("上传头像图片只能是 JPG 格式!");
      }
      if (!isLt2M) {
        this.$message.error("上传头像图片大小不能超过 2MB!");
      }
      return isJPG && isLt2M;
    },
  },
};
</script>

<style lang="scss" scoped>
.search {
  height: 40px;
  display: flex;
  padding: 8px;
}

.btnfather {
  text-align: center;
  margin-top: 100px;
  .btn {
    width: 80%;
  }
}

.el-drawer__wrapper {
  position: fixed;
  top: 70px;
}

.el-image {
  width: 60px;
  height: 60px;
}

.el-select {
  width: 100%;
  margin-right: 20px;
}

::v-deep .el-image__inner {
  border-radius: 10%;
}

.avatar-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 100px;
  height: 100px;
}
.avatar-uploader:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
}
.avatar {
  width: 100px;
  height: 100px;
  display: block;
  align-items: center;
}
.el-select {
  width: 200px;
}
</style>