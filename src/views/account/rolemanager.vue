<template>
  <div class="role" ref="role">
    <div class="search">
      <el-button type="primary" @click="addrole">添加角色</el-button>
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
      <el-table-column label="角色编号" min-width="1">
        <template slot-scope="scope">
          <span style="margin-left: 10px">{{ scope.row.roalId }}</span>
        </template>
      </el-table-column>

      <el-table-column label="角色名称" min-width="5">
        <template slot-scope="scope">
          <span style="margin-left: 10px">{{ scope.row.rolename }}</span>
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
      :title="isadd ? '添加角色' : '修改角色'"
      :visible.sync="drawer"
      :direction="direction"
      @close="drawerClose"
    >
      <!-- 需要配置module数据和校验数据对象，并设置ref，为下边获取dom做准备-->
      <el-form
        :model="roledata"
        :rules="rolerules"
        ref="formelement"
        label-width="100px"
        class="demo-ruleForm"
      >
        <!-- prop 指向的是校验数据的key -->
        <el-form-item label="角色名称" prop="rolename">
          <!-- 绑定数据对象 -->
          <el-input v-model="roledata.rolename" autocomplete="off"></el-input>
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
export default {
  mounted() {
    this.gettabledata();
  },
  data() {
    return {
      drawer: false,
      direction: "rtl",
      tableData: [],
      //添加角色数据
      roledata: {
        rolename: "",
      },
      isadd: true,
      //表单验证数据
      rolerules: {
        //验证用户名，key必须和表单数据key一致，失去焦点时机去验证
        rolename: [{ required: true, message: '请输入活动名称', trigger: "blur" }],
      },
    };
  },
  methods: {
    //获取table数据
    gettabledata() {
    var  loading =  this.$showload(this.$refs.role)
      this.$get("/gettabledata").then((res) => {
        this.tableData = res.data;
       this.$closeload(loading)
      }).catch((error) => {
        //隐藏全局错误处理，当前页面去处理
        //  error.hideNormalError()
        this.$closeload(loading);
      });
    },

    handleEdit(index, row) {
      this.isadd = false;
      this.drawer = true;
      //数据回显，这里不能这样回显，浅拷贝有问题
      this.roledata.rolename = row.rolename;
    },
    handleDelete(index, row) {
      console.log(index, row);
      this.$con_f(`确定删除  ${row.rolename}  角色吗？`, () => {
        this.gettabledata();
      });
      //获取角色id
      //请求删除，删除当前角色，请求列表数据
    },
    drawerClose() {
      //恢复初始值,饿了吗框架问题，清空表单，数据不会清空
      this.roledata = this.$options.data().roledata
    },
    addrole() {
      this.isadd = true;
      this.drawer = true;
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
  },
};
</script>

<style lang="scss" scoped>
.search {
  padding: 8px;
  height: 40px;
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
</style>