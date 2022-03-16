<script setup>
import {onMounted, onUnmounted, ref} from "vue";
import axios from "../http/axios";
import moment from "moment";
import {useRoute} from "vue-router";
import * as echarts from 'echarts/core';
import {
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from 'echarts/components';
import {
  LineChart,
  PieChart
} from 'echarts/charts';
import {
  CanvasRenderer
} from 'echarts/renderers';
import {useStore} from "vuex";

echarts.use(
    [PieChart, ToolboxComponent, GridComponent, LegendComponent, LineChart, CanvasRenderer, TitleComponent, TooltipComponent]
);
let resizeFun = undefined
const store = useStore()
const img = import.meta.globEager("./../assets/img/*")
const times = ref([]);
const testCaseList = ref([])
const deviceList = ref([])
const loading = ref(false);
const defaultTime = ref([
  new Date(2000, 1, 1, 0, 0, 0),
  new Date(2000, 2, 1, 23, 59, 59),
])
const getPhoneImg = (name, url) => {
  let result;
  if (url === null || url.length === 0) {
    result = img['./../assets/img/default.png'].default
  } else {
    result = url;
  }
  return result;
}
const getIndexImg = (index) => {
  let result;
  switch (index) {
    case 0:
      result = img['./../assets/img/First.png'].default
      break
    case 1:
      result = img['./../assets/img/Second.png'].default
      break
    case 2:
      result = img['./../assets/img/Third.png'].default
      break
  }
  return result;
}
const shortcuts = ref([
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    },
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    },
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    },
  },
])
const route = useRoute()
const result = ref({})
const formatTime = (data) => {
  let time = "";
  const days = parseInt(data / 86400);
  data = data % 86400;
  const hours = parseInt(data / 3600);
  data = data % 3600;
  const minutes = parseInt(data / 60);
  data = data % 60;
  if (0 < days) {
    time = days + "天" + hours + "小时" + minutes + "分" + data + "秒";
  } else {
    time = hours + "小时" + minutes + "分" + data + "秒";
  }
  return time;
}
const getCaseIds = (ids) => {
  let list = ids.map(obj => {
    return obj['case_id'];
  })
  if (list.length > 0) {
    axios.get("/controller/testCases/findByIdIn", {
      params: {
        ids: list
      }
    }).then((resp) => {
      if (resp['code'] === 2000) {
        testCaseList.value = resp['data']
      }
    })
  }
}
const getDeviceIds = (ids) => {
  let list = ids.map(obj => {
    return obj['device_id'];
  })
  if (list.length > 0) {
    axios.get("/controller/devices/findByIdIn", {
      params: {
        ids: list
      }
    }).then((resp) => {
      if (resp['code'] === 2000) {
        deviceList.value = resp['data']
      }
    })
  }
}
const getCaseName = (id) => {
  let name = ""
  for (let i in testCaseList.value) {
    if (testCaseList.value[i].id === id) {
      name = testCaseList.value[i].name
      break
    }
  }
  return name
}
const getDeviceInfo = (id) => {
  let result = {}
  for (let i in deviceList.value) {
    if (deviceList.value[i].id === id) {
      result = deviceList.value[i]
      break
    }
  }
  return result
}
const setStatus = (data) => {
  let result = [{name: 0, value: 0},
    {name: 1, value: 0},
    {name: 2, value: 0},
    {name: 3, value: 0}]
  for (let i in data) {
    for (let j in result) {
      if (result[j].name === data[i]['status']) {
        result[j].value += data[i]['total'];
        break
      }
    }
  }
  return result
}
const getData = () => {
  loading.value = true;
  let chart = echarts.getInstanceByDom(document.getElementById('projectChart'));
  if (chart == null) {
    chart = echarts.init(document.getElementById('projectChart'));
  }
  axios.get("/controller/results/chart", {
    params: {
      startTime: times.value[0],
      endTime: times.value[1],
      projectId: route.params.projectId
    }
  }).then((resp) => {
    loading.value = false;
    if (resp['code'] === 2000) {
      result.value = resp['data']
      getCaseIds(result.value['case'])
      getDeviceIds(result.value['device'])
      let option = {
        animationDuration: 3000,
        title: {
          text: store.state.project.projectName + "运行情况总览",
          subtext: times.value[0] + " ~ " + times.value[1],
          textStyle: {
            color: "#606266",
          },
          x: "center",
          y: "top",
        },
        tooltip: {
          trigger: 'axis',
        },
        grid: {top: '55%'},
        toolbox: {
          feature: {
            saveAsImage: {show: true, title: "保存"},
          },
        },
        xAxis: {
          type: 'category',
          data: result.value['pass'].map(obj => {
            return obj['date'];
          })
        },
        yAxis: [{name: "单位(%)", max: 100, min: 0}],
        series: [
          {
            smooth: true,
            name: '当天通过率',
            type: 'line',
            data: result.value['pass'].map(obj => {
              return obj['rate'];
            }),
            itemStyle: {
              color: '#67C23A'
            },
          },
          {
            name: '状态分布',
            type: 'pie',
            radius: [0, '30%'],
            center: ['50%', '30%'],
            data: setStatus(result.value['status']).map(obj => {
              let name = "";
              switch (obj['name']) {
                case 0:
                  name = "其他";
                  break
                case 1:
                  name = "通过";
                  break
                case 2:
                  name = "警告";
                  break
                case 3:
                  name = "失败";
                  break
              }
              return {name: name, value: obj['value']}
            }),
            label: {
              formatter: '{b}: {@2012}次 ({d}%)'
            },
          }
        ]
      };
      chart.setOption(option);
      if (resizeFun !== undefined) {
        window.removeEventListener("resize", resizeFun);
      }
      resizeFun = () => {
        chart.resize();
      }
      window.addEventListener("resize", resizeFun);
    }
  })
}
onMounted(() => {
  let chart = echarts.getInstanceByDom(document.getElementById('projectChart'));
  if (chart == null) {
    chart = echarts.init(document.getElementById('projectChart'));
  }
  chart.dispose();
  const end = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
  const start = moment(new Date().setTime(new Date().getTime() - 3600 * 1000 * 24 * 7)).format("YYYY-MM-DD HH:mm:ss")
  times.value = [start, end];
  getData()
})
onUnmounted(() => {
  if (resizeFun !== undefined) {
    window.removeEventListener("resize", resizeFun);
  }
})
</script>
<template>
  <el-card>
    <el-date-picker
        v-model="times"
        type="datetimerange"
        :shortcuts="shortcuts"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :clearable="false"
        @change="getData"
        value-format="YYYY-MM-DD HH:mm:ss"
        :unlink-panels="true"
        :default-time="defaultTime"
        size="small"
    >
    </el-date-picker>
  </el-card>
  <el-row :gutter="20" style="margin-top: 20px">
    <el-col :span="8">
      <el-table :data="result['case']" style="width: 100%" border>
        <el-table-column header-align="center" label="用例运行时长排行榜（Top 5）">
          <el-table-column align="center" prop="case_id" label="用例id" width="90">
            <template #default="scope">
              <img v-if="scope.$index<=3" width="30" :src="getIndexImg(scope.$index)"
                   style="position: absolute;left: 0px;top:0px">
              {{ scope.row['case_id'] }}
            </template>
          </el-table-column>
          <el-table-column header-align="center" label="用例名称" show-overflow-tooltip>
            <template #default="scope">
              {{ getCaseName(scope.row['case_id']) }}
            </template>
          </el-table-column>
          <el-table-column prop="total" align="center" label="时长" width="130">
            <template #default="scope">
              {{ formatTime(scope.row.total) }}
            </template>
          </el-table-column>
        </el-table-column>
      </el-table>

      <el-table :data="result['device']" style="width: 100%;margin-top: 20px" border>
        <el-table-column header-align="center" label="设备运行时长排行榜（Top 5）">
          <el-table-column align="center" prop="device_id" label="图片" width="60">
            <template #default="scope">
              <img v-if="scope.$index<=3" width="30" :src="getIndexImg(scope.$index)"
                   style="position: absolute;left: 0px;top:0px;z-index: 1000">
              <div style="text-align: center">
                <el-image
                    style="height: 100%"
                    fit="contain"
                    :src="getPhoneImg(getDeviceInfo(scope.row['device_id']).model,getDeviceInfo(scope.row['device_id'])['imgUrl'])"
                    :preview-src-list="[getPhoneImg(getDeviceInfo(scope.row['device_id']).model,getDeviceInfo(scope.row['device_id'])['imgUrl'])]"
                    hide-on-click-modal
                />
              </div>
            </template>
          </el-table-column>
          <el-table-column align="center" width="100" label="设备型号" show-overflow-tooltip>
            <template #default="scope">
              {{ getDeviceInfo(scope.row['device_id']).model }}
            </template>
          </el-table-column>
          <el-table-column header-align="center" label="序列号" show-overflow-tooltip>
            <template #default="scope">
              {{ getDeviceInfo(scope.row['device_id'])['udId'] }}
            </template>
          </el-table-column>
          <el-table-column prop="total" align="center" label="时长" width="130">
            <template #default="scope">
              {{ formatTime(scope.row.total) }}
            </template>
          </el-table-column>
        </el-table-column>
      </el-table>
    </el-col>
    <el-col :span="16">
      <el-card shadow="hover">
        <div id="projectChart" style="width: 100%;height: 650px;"></div>
      </el-card>
    </el-col>
  </el-row>
</template>