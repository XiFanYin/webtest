<template>
  <div>

    测试keep-alive是否管用
    <el-input v-model="input1" placeholder="请输入内容"></el-input>
  </div>
</template>
<script>
export default {
  data() {
    return {
      input1: "",
    };
  },
  created() {
    console.log("created");
  },
  mounted() {
    console.log("mounted");
  },

  activated() {
    console.log("activated");
  },

  deactivated() {
    console.log("deactivated");
  },

  destroyed() {
    console.log("destroyed");
  },
};
</script>

<style lang="scss" scoped>
</style>