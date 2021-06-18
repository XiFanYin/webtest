<template>
  <div ref="main" class="echart"></div>
</template>
<script>
//导入图标
import * as echarts from "echarts";
export default {
  data() {
    return {
      totlePricedata: [
        { roomTypeName: "标准间", totleprice: 5000 },
        { roomTypeName: "上午套房", totleprice: 1760 },
        { roomTypeName: "三人间", totleprice: 1000 },
        { roomTypeName: "单人间", totleprice: 600 },
        { roomTypeName: "海景房", totleprice: 320 },
        { roomTypeName: "大床房", totleprice: 680 },
        { roomTypeName: "豪华套房", totleprice: 1000 },
        { roomTypeName: "总统套房", totleprice: 6000 },
      ],
    };
  },

  mounted() {
    // 基于准备好的dom，初始化echarts实例
    var myChart = echarts.init(this.$refs.main);
    // 绘制图表
    myChart.setOption({
      title: {
        text: "客房类型销售统计",
      },
      tooltip: {},
      xAxis: {
        data: this.totlePricedata.map(data=>{return  data.roomTypeName}),
      },
      yAxis: {},
      series: [
        {
          name: "销量",
          type: "bar",
          data: this.totlePricedata.map(data=>{return data.totleprice}),
        },
      ],
    });
  },
};
</script>

<style lang="scss" scoped>
.echart {
  width: 700px;
  height: 300px;
}
</style>