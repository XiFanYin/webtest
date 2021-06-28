<template>
  <div>
    测试keep-alive是否管用
    <el-input v-model="input1" placeholder="请输入内容"></el-input>
    <button @click="check">检查浏览器是否支持</button>

    <button @click="connect">连接血压计</button>
    <button @click="start">开始测量</button>
    <button @click="stop">停止测量</button>
  </div>
</template>
<script>
import serial from "../../utils/serial";
export default {
  data() {
    return {
      input1: "",
      port: null,
      reader: null,
      writer: null,
    };
  },
  methods: {
    check() {
      if (serial.isbrowserSupportSerial()) {
        alert("当前浏览器支持串口通讯");
      } else {
        alert("当前浏览器不支持串口通讯");
      }
    },

    connect() {
      serial.connectBloodPress();
    },
    start(){
      serial.startMeasure();
    },
    stop(){
      serial.stopMeasure();
    }
  },
};
</script>

<style lang="scss" scoped>
</style>