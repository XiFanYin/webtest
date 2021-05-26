<template>
  <div class="role">
    <div class="search">
      <el-button type="primary" @click="drawer = !drawer">添加角色</el-button>
    </div>

    <el-table :data="tableData" style="width: 100%" stripe border  :header-cell-style="{textAlign: 'center'}"   :cell-style="{ textAlign: 'center' }">
      <el-table-column label="角色编号" min-width="1">
        <template slot-scope="scope">
          <span style="margin-left: 10px">{{ scope.row.roalId }}</span>
        </template>
      </el-table-column>

      <el-table-column label="角色名称" min-width="5">
        <template slot-scope="scope">
          <span style="margin-left: 10px">{{ scope.row.roalname }}</span>
        </template>
      </el-table-column>



      <el-table-column label="操作" min-width="1">
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
      title="我是标题"
      :visible.sync="drawer"
      :direction="direction"
      :before-close="handleClose"
    >
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
    };
  },
  methods: {
    //获取table数据
    gettabledata() {
      this.$get("/gettabledata").then((res) => {
        this.tableData = res.data;
      });
    },

    handleEdit(index, row) {
      console.log(index, row);
    },
    handleDelete(index, row) {
      console.log(index, row);
    },
     handleClose(done) {
        this.$confirm('确认关闭？')
          .then(_ => {
            done();
          })
          .catch(_ => {});
      }
  },
};
</script>

<style lang="scss" scoped>
.search {
  padding: 8px;
}

.role {
  background: #ffffff;
  margin: 10px 10px;
}

</style>