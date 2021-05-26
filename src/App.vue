<template>
  <div class="body">
    <router-view  v-loading="$store.state.obj.fullloading"/>
  </div>
</template>

<style lang="scss">
 .body{
   background: #EEEEEE;
 }


</style>
