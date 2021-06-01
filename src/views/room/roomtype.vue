<template>
  <div>
    类型管理和角色管理ui一样，没有特殊情况不在做处理。
    <h1>下边展示富文本编辑框基本使用</h1>
    <quill-editor
      v-model="content"
      ref="myQuillEditor"
      class="quilleditor">
    </quill-editor>
  </div>
</template>
<script>
export default {
  data() {
    return {
      content: "<p>example content</p>",
    };
  },
};
</script>

<style lang="scss" scoped>

.quilleditor{
    height: 500px;
}
</style>