<template>
  <div>
    <quill-editor v-model="content" ref="myQuillEditor" class="quilleditor">
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
.quilleditor {
  height: calc(100vh - 500px);
}
</style>