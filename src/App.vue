<template>
  <div class="body">
    {{$store.state.loadingbackground}}
    <router-view  v-loading="$store.state.fullloading"/>
  </div>
</template>




<style lang="scss">
 .body{
   background: #EEEEEE;
 }



</style>
