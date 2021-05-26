<template>
  <div class="body">
    <router-view  v-loading="$store.state.obj.loading"/>
  </div>
</template>

<style lang="scss">
 .body{
   background: #EEEEEE;
 }


</style>
