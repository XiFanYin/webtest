<template>
  <div>
    <div class="mine">
      <div>
        <el-image
          style="width: 100px; height: 100px"
          :src="require('@/assets/userpic.jpg')"
          fit="fit"
        />
      </div>
      <div class="info">
        <p>姓名：张三</p>
        <p>性别：男</p>
        <p>电话：155****1578</p>
        <p>角色：管理员</p>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  mounted() {},
};
</script>

<style lang="scss" scoped>
.mine {
  display: flex;
  padding: 20px;
}
.photo {
  border-radius: 10px;
}
.info {
  margin-left: 40px;
  line-height: 30px;
}
</style>