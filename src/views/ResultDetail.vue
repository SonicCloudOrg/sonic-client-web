<script setup>
import {useRoute, useRouter} from "vue-router";
import {onMounted, ref} from "vue";
import axios from "../http/axios";
import StepLog from '../components/StepLog.vue'
import * as echarts from 'echarts/core';
import {
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from 'echarts/components';
import {
  LineChart
} from 'echarts/charts';
import {
  CanvasRenderer
} from 'echarts/renderers';
import {ElMessage} from "element-plus";

echarts.use(
    [ToolboxComponent, GridComponent, LegendComponent, LineChart, CanvasRenderer, TitleComponent, TooltipComponent]
);
const router = useRouter()
const route = useRoute()
const results = ref({})
const testCaseList = ref([])
const deviceList = ref([])
const caseId = ref(0)
const deviceId = ref('')
const stepList = ref([])
const done = ref(false)
const stepLoading = ref(false)
const type = ref("log")
let page = 1;
let resizeFun = undefined;
const switchType = (e) => {
  if (e.props.name === "perform") {
    getPerform(caseId.value, deviceId.value);
  }
}
const getLegend = (data) => {
  let result = [];
  if (data.length > 0) {
    for (let k in JSON.parse(data[0].log)) {
      result.push(k)
    }
  }
  return result;
}
const getSeries = (data, legend) => {
  let result = []
  if (data.length > 0 && legend.length > 0) {
    for (let j in legend) {
      let d = [];
      for (let i in data) {
        for (let k in JSON.parse(data[i].log)) {
          if (k === legend[j]) {
            d.push(JSON.parse(data[i].log)[k])
          }
        }
      }
      result.push({
        name: legend[j],
        type: "line",
        areaStyle: {},
        data: d
      });
    }
  }
  return result;
}
const getTimes = (data) => {
  let result = [];
  for (let i in data) {
    result.push(data[i].time);
  }
  return result;
}
const getPerform = (cid, did) => {
  echarts.init(document.getElementById('mem' + cid + did)).dispose();
  echarts.init(document.getElementById('bat' + cid + did)).dispose();
  let mem = echarts.getInstanceByDom(document.getElementById('mem' + cid + did));
  if (mem == null) {
    mem = echarts.init(document.getElementById('mem' + cid + did));
  }
  let bat = echarts.getInstanceByDom(document.getElementById('bat' + cid + did));
  if (bat == null) {
    bat = echarts.init(document.getElementById('bat' + cid + did));
  }
  let option = {
    title: {
      textStyle: {
        color: "#606266",
      },
      x: "center",
      y: "top",
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    toolbox: {
      feature: {
        saveAsImage: {show: true, title: "保存"},
      },
    },
    xAxis: [
      {
        type: "category",
        boundaryGap: false,
        axisTick: {
          inside: true,
        },
        axisLine: {
          lineStyle: {
            color: "#909399",
            shadowBlur: 2.5,
          },
        },
        axisLabel: {
          interval: 0,
          rotate: 40,
        },
      },
    ],
    legend: {
      top: "8%",
      textStyle: {
        color: "#606266",
      },
    },
    grid: {
      top: "24%",
      left: "3%",
      right: "4%",
      bottom: "10%",
      containLabel: true,
    },
    yAxis: [
      {
        type: "value",
        axisTick: {
          inside: true,
        },
        axisLine: {
          lineStyle: {
            color: "#909399",
            shadowBlur: 2.5,
          },
        },
      },
    ],
  };
  mem.showLoading();
  bat.showLoading();
  axios.get("/controller/resultDetail/listAll", {
    params: {
      caseId: caseId.value,
      resultId: route.params.resultId,
      deviceId: deviceId.value,
      type: 'perform',
    }
  }).then(async resp => {
    if (resp['code'] === 2000 && resp['data'].length > 0) {
      mem.hideLoading()
      bat.hideLoading()
      let memList = [];
      let batList = [];
      for (let i in resp['data']) {
        if (resp['data'][i].status === 1) {
          memList.push(resp['data'][i]);
        }
        if (resp['data'][i].status === 2) {
          batList.push(resp['data'][i]);
        }
      }
      let memLegend = getLegend(memList);
      let memData = getSeries(memList, memLegend)
      mem.setOption({
        title: {text: "内存详情"},
        series: memData,
        legend: {
          data: memLegend,
        },
        xAxis: [
          {
            data: getTimes(memList),
          },
        ],
        yAxis: [{name: "单位(KB)"}],
      });
      mem.setOption(option);
      mem.resize()
      let batLegend = getLegend(batList);
      let batData = getSeries(batList, batLegend)
      bat.setOption({
        title: {text: "内存详情"},
        series: batData,
        legend: {
          data: batLegend,
        },
        xAxis: [
          {
            data: getTimes(batList),
          },
        ],
        yAxis: [{name: "单位(%)", max: 100, min: 0}],
      });
      bat.setOption(option);
      bat.resize()
      if (resizeFun !== undefined) {
        window.removeEventListener("resize", resizeFun);
      }
      resizeFun = () => {
        mem.resize();
        bat.resize();
      }
      window.addEventListener("resize", resizeFun);
    } else {
      ElMessage.info({
        message: "性能数据不足！",
      });
    }
  })
}
const switchDevice = async (e) => {
  page = 1;
  done.value = false
  stepList.value = []
  type.value = "log"
  await getStepList();
}
const loadMore = () => {
  page++;
  getStepList()
}
const getStepList = () => {
  stepLoading.value = true
  axios.get("/controller/resultDetail/list", {
    params: {
      caseId: caseId.value,
      resultId: route.params.resultId,
      deviceId: deviceId.value,
      type: 'step',
      page: page
    }
  }).then(async resp => {
    stepLoading.value = false
    if (resp['code'] === 2000) {
      stepList.value.push(...resp.data.content)
      if (resp.data['totalPages'] === page) {
        done.value = true;
      }
    }
  })
}
const getDeviceList = (ids) => {
  axios.get("/controller/devices/findByIdIn", {
    params: {
      ids: ids.map(obj => {
        return obj.deviceId;
      })
    }
  }).then(async resp => {
    if (resp['code'] === 2000) {
      deviceList.value = resp.data
      for (let i in ids) {
        for (let j in deviceList.value) {
          if (ids[i].deviceId === deviceList.value[j].id) {
            deviceList.value[j].status = ids[i].status
          }
        }
      }
      if (deviceList.value.length > 0) {
        deviceId.value = deviceList.value[0].id + ''
        getStepList();
      }
    }
  })
}
const getResultInfo = (id) => {
  axios.get("/controller/results", {params: {id}}).then(async resp => {
    if (resp['code'] === 2000) {
      results.value = resp.data
      findCaseStatus(results.value['id'])
    }
  })
}
const findCaseStatus = (id) => {
  axios.get("/controller/results/findCaseStatus", {params: {id}}).then(resp => {
    if (resp['code'] === 2000) {
      testCaseList.value = resp.data
      if (testCaseList.value.length > 0) {
        caseId.value = testCaseList.value[0]['case'].id
        if (testCaseList.value[0]['device'].length > 0) {
          getDeviceList(testCaseList.value[0]['device'])
        }
      }
    }
  })
}
onMounted(() => {
  getResultInfo(route.params.resultId)
})
</script>
<template>
  <el-page-header
      @back="router.go(-1)"
      content="报告详情"
      style="margin-bottom: 20px"
  >
  </el-page-header>
  {{ results.id }}
  <el-card>
    <el-collapse v-model="caseId" accordion>
      <el-collapse-item v-for="c in testCaseList" :key="c" :name="c['case'].id" style="position: relative">
        <template #title>
          <strong style="color: #606266">{{ c['case'].name }}</strong>
          <el-tag style="margin-left: 10px" size="small" :type="c.status===1?'success':
            c.status===2?'warning':
             c.status === 3 ? 'danger' : 'info'">
            <i class="el-icon-loading" style="margin-right: 5px;" v-if="c.status === 4"/>{{
              c.status === 0 ? '未开始' :
                  c.status === 1 ? '通过' :
                      c.status === 2 ? '警告' :
                          c.status === 3 ? '失败' : '运行中'
            }}
          </el-tag>
          <div style="position:absolute;right: 30px">
            <el-tag size="small">{{ c.startTime }}</el-tag>
            <el-tag size="small">{{ c.endTime }}</el-tag>
          </div>
        </template>
        <el-tabs v-model="deviceId" type="border-card" tab-position="left" @tab-click="switchDevice">
          <el-tab-pane v-for="d in deviceList" :name="d.id+''">
            <template #label>
              <div class="flex-center">
                {{ d.model }}
                <el-tag style="margin-left: 10px" size="small" :type="d.status===1?'success':
            d.status===2?'warning':
             d.status === 3 ? 'danger' : 'info'">
                  <i class="el-icon-loading" style="margin-right: 5px;" v-if="d.status === 4"/>{{
                    d.status === 1 ? '通过' :
                        d.status === 2 ? '警告' :
                            d.status === 3 ? '失败' : '运行中'
                  }}
                </el-tag>
              </div>
            </template>
            <el-tabs v-model="type" type="border-card" @tab-click="switchType">
              <el-tab-pane label="运行日志" name="log">
                <step-log @loadMore="loadMore" :is-done="done" :is-read-only="true" :debug-loading="stepLoading"
                          :step-log="stepList"/>
              </el-tab-pane>
              <el-tab-pane label="性能信息" name="perform">
                <el-card>
                  <div
                      :id="'mem'+c['case'].id+d.id"
                      style="width: 100%; height: 400px; margin-top: 20px"
                  ></div>
                </el-card>
                <el-card style="margin-top: 10px">
                  <div
                      :id="'bat'+c['case'].id+d.id"
                      style="width: 100%; height: 400px; margin-top: 20px"
                  ></div>
                </el-card>
              </el-tab-pane>
              <el-tab-pane label="运行录像" name="record">
              </el-tab-pane>
            </el-tabs>
          </el-tab-pane>
        </el-tabs>
      </el-collapse-item>
    </el-collapse>
  </el-card>
</template>