<script setup>
import {onMounted, ref} from "vue";
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

echarts.use(
    [PieChart, ToolboxComponent, GridComponent, LegendComponent, LineChart, CanvasRenderer, TitleComponent, TooltipComponent]
);
const img = import.meta.globEager("./../assets/img/*")
const times = ref([]);
const testCaseList = ref([])
const deviceList = ref([])
const loading = ref(false);
const defaultTime = ref([
  new Date(2000, 1, 1, 0, 0, 0),
  new Date(2000, 2, 1, 23, 59, 59),
])
const getImg = (name) => {
  let result;
  try {
    result = img['./../assets/img/' + name + '.jpg'].default
  } catch {
    result = img['./../assets/img/unName.jpg'].default
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
const getData = () => {
  loading.value = true;
  let chart = echarts.getInstanceByDom(document.getElementById('projectChart'));
  if (chart == null) {
    chart = echarts.init(document.getElementById('projectChart'));
  }
  let option = {
    legend: {},
    tooltip: {
      trigger: 'axis',
      showContent: false
    },
    dataset: {
      source: [
        ['product', '2012', '2013', '2014', '2015', '2016', '2017'],
        ['Milk Tea', 56.5, 82.1, 88.7, 70.1, 53.4, 85.1],
        ['Matcha Latte', 51.1, 51.4, 55.1, 53.3, 73.8, 68.7],
        ['Cheese Cocoa', 40.1, 62.2, 69.5, 36.4, 45.2, 32.5],
        ['Walnut Brownie', 25.2, 37.1, 41.2, 18, 33.9, 49.1]
      ]
    },
    xAxis: {type: 'category'},
    yAxis: {gridIndex: 0},
    grid: {top: '55%'},
    series: [
      {
        type: 'line',
        smooth: true,
        seriesLayoutBy: 'row',
        emphasis: {focus: 'series'}
      },
      {
        type: 'line',
        smooth: true,
        seriesLayoutBy: 'row',
        emphasis: {focus: 'series'}
      },
      {
        type: 'line',
        smooth: true,
        seriesLayoutBy: 'row',
        emphasis: {focus: 'series'}
      },
      {
        type: 'line',
        smooth: true,
        seriesLayoutBy: 'row',
        emphasis: {focus: 'series'}
      },
      {
        type: 'pie',
        id: 'pie',
        radius: '30%',
        center: ['50%', '25%'],
        emphasis: {
          focus: 'self'
        },
        label: {
          formatter: '{b}: {@2012} ({d}%)'
        },
        encode: {
          itemName: 'product',
          value: '2012',
          tooltip: '2012'
        }
      }
    ]
  };
  chart.on('updateAxisPointer', function (event) {
    const xAxisInfo = event.axesInfo[0];
    if (xAxisInfo) {
      const dimension = xAxisInfo.value + 1;
      chart.setOption({
        series: {
          id: 'pie',
          label: {
            formatter: '{b}: {@[' + dimension + ']} ({d}%)'
          },
          encode: {
            value: dimension,
            tooltip: dimension
          }
        }
      });
    }
  });
  chart.setOption(option);
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
    }
  })
}
onMounted(() => {
  const end = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
  const start = moment(new Date().setTime(new Date().getTime() - 3600 * 1000 * 24 * 7)).format("YYYY-MM-DD HH:mm:ss")
  times.value = [start, end];
  getData()
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
              <el-image
                  style="height: 100%"
                  fit="contain"
                  :src="getImg(getDeviceInfo(scope.row['device_id']).model)"
                  :preview-src-list="[getImg(getDeviceInfo(scope.row['device_id']).model)]"
                  hide-on-click-modal
              >
              </el-image>
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
        <div id="projectChart" style="width: 100%;height: 338px;"></div>
      </el-card>
    </el-col>
  </el-row>
</template>