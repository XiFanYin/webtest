<template>
  <div @click="aaa">
      会员健康页面
  </div>

  
</template>
<script>
export default {
    data() {
      return {
        teststud:{}
      }
    },    


    methods: {
        aaa(){   
           this.$store.commit('setStateVal',{address:"郑州"} )
        },
        
    },
}
</script>

<style lang="scss" scoped>
</style>