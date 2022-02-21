<script setup>
import {useRoute, useRouter} from "vue-router";
import {nextTick, onMounted, onUnmounted, ref, reactive} from "vue";
import axios from "../http/axios";
import StepLog from '../components/StepLog.vue'
import "vue3-video-play/dist/style.css";
import {videoPlay} from "vue3-video-play";
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
import {ElMessage} from "element-plus";

echarts.use(
    [PieChart, ToolboxComponent, GridComponent, LegendComponent, LineChart, CanvasRenderer, TitleComponent, TooltipComponent]
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
const recordUrl = ref("")
const videoOptions = reactive({
  width: "48%",
  height: "auto",
  controlBtns: [
    "audioTrack",
    "quality",
    "volume",
    "fullScreen",
    "speedRate"
  ],
});
let page = 1;
let resizeFun = undefined;
let resizeChart = undefined;
const subTime = (date1, date2) => {
  let data = (new Date(date2) - new Date(date1)) / 1000;
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
const changeCase = (e) => {
  if (e !== "") {
    page = 1;
    done.value = false
    stepList.value = []
    type.value = "log"
    deviceList.value = []
    for (let i in testCaseList.value) {
      if (testCaseList.value[i]['case'].id === e) {
        getDeviceList(testCaseList.value[i]['device'])
        break;
      }
    }
  }
}
const switchType = (e) => {
  if (e.props.name === "perform") {
    nextTick(() => {
      getPerform(caseId.value, deviceId.value);
    })
  }
  if (e.props.name === "record") {
    nextTick(() => {
      getRecord();
    })
  }
}
const getRecord = () => {
  recordUrl.value = ""
  axios.get("/controller/resultDetail/listAll", {
    params: {
      caseId: caseId.value,
      resultId: route.params.resultId,
      deviceId: deviceId.value,
      type: 'record',
    }
  }).then(resp => {
    if (resp['code'] === 2000 && resp['data'].length > 0) {
      recordUrl.value = resp['data'][0].log
    }
  });
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
      let batLegend = getLegend(batList);
      let batData = getSeries(batList, batLegend)
      bat.setOption({
        title: {text: "电量详情"},
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
      if (resizeFun !== undefined) {
        window.removeEventListener("resize", resizeFun);
      }
      resizeFun = () => {
        mem.resize();
        bat.resize();
      }
      window.addEventListener("resize", resizeFun);
    } else {
      mem.showLoading({
        text: '内存数据不足',
        fontSize: 20,
        textColor: '#606266',
        showSpinner: false,
      })
      bat.showLoading({
        text: '电量数据不足',
        fontSize: 20,
        textColor: '#606266',
        showSpinner: false,
      })
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
  let list = ids.map(obj => {
    return obj.deviceId;
  });
  if (list.length > 0) {
    axios.get("/controller/devices/findByIdIn", {
      params: {
        ids: list
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
  let chart = echarts.getInstanceByDom(document.getElementById('chart'));
  if (chart == null) {
    chart = echarts.init(document.getElementById('chart'));
  }
  let option = {
    title: {
      text: '用例运行状态分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      right: 'right'
    }
  };
  axios.get("/controller/results/findCaseStatus", {params: {id}}).then(resp => {
    if (resp['code'] === 2000) {
      testCaseList.value = resp.data
      let legend = [{value: 0, name: '未开始'},
        {value: 0, name: '通过'},
        {value: 0, name: '警告'},
        {value: 0, name: '失败'},
        {value: 0, name: '运行中'},]
      for (let i in testCaseList.value) {
        legend[testCaseList.value[i].status].value++
      }
      chart.setOption({
        series: [
          {
            name: '用例状态',
            type: 'pie',
            radius: '50%',
            data: legend
          }
        ]
      })
      chart.setOption(option)
      if (resizeChart !== undefined) {
        window.removeEventListener("resize", resizeChart);
      }
      resizeChart = () => {
        chart.resize()
      }
      window.addEventListener("resize", resizeChart);
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
  let chart = echarts.getInstanceByDom(document.getElementById('chart'));
  if (chart == null) {
    chart = echarts.init(document.getElementById('chart'));
  }
  chart.dispose()
  getResultInfo(route.params.resultId)
})
onUnmounted(() => {
  if (resizeChart !== undefined) {
    window.removeEventListener("resize", resizeChart);
  }
  if (resizeFun !== undefined) {
    window.removeEventListener("resize", resizeFun);
  }
})
</script>
<template>
  <el-page-header
      @back="router.go(-1)"
      content="报告详情"
      style="margin-bottom: 20px"
  >
  </el-page-header>
  <el-row :gutter="20">
    <el-col :span="12">
      <el-card shadow="hover">
        <template #header><strong>报告信息</strong></template>
        <el-form
            label-position="left"
            class="demo-table-expand"
            label-width="80px"
            style="margin-left: 10px; word-break: break-all"
            v-if="results['id']"
        >
          <el-form-item label="结果Id">
            <span>{{ results['id'] }}</span>
          </el-form-item>
          <el-form-item label="测试套件">
            <span>{{ results['suiteName'] }}</span>
          </el-form-item>
          <el-form-item label="执行用户">
            <el-tag size="small" v-if="results['strike'] === 'SYSTEM'"
            >定时任务
            </el-tag
            >
            <span v-else>{{ results['strike'] }}</span>
          </el-form-item>
          <el-form-item label="运行状态">
            <el-tag type="success" size="small" v-if="results['status'] === 1"
            >测试通过
            </el-tag
            >
            <el-tag type="info" size="small" v-if="results['status'] === 0"
            ><i class="el-icon-loading"></i> 运行中
            </el-tag
            >
            <el-tag type="danger" size="small" v-if="results['status'] === 3"
            >测试失败
            </el-tag
            >
            <el-tag type="warning" size="small" v-if="results['status']=== 2"
            >测试告警
            </el-tag
            >
          </el-form-item>
          <el-form-item label="创建时间">
            <span>{{ results['createTime'] }}</span>
          </el-form-item>
          <el-form-item label="结束时间">
            <span v-if="results['endTime']">{{ results['endTime'] }}</span>
            <span v-else>未知</span>
          </el-form-item>
          <el-form-item label="总耗时">
            <span v-if="results['endTime']">{{ subTime(results['createTime'], results['endTime']) }}</span>
            <span v-else>未知</span>
          </el-form-item>
        </el-form>
      </el-card>
    </el-col>
    <el-col :span="12">
      <el-card shadow="hover">
        <div id="chart" style="width: 100%;height: 338px;"></div>
      </el-card>
    </el-col>
  </el-row>
  <el-divider><span style="color: #909399;">运行信息</span></el-divider>
  <el-card shadow="hover">
    <el-collapse v-model="caseId" accordion @change="changeCase">
      <el-collapse-item v-for="c in testCaseList" :key="c" :name="c['case'].id" style="position: relative">
        <template #title>
          测试用例：<strong style="color: #606266">{{ c['case'].name }}</strong>
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
          <div style="position:absolute;right: 30px;color: #606266">
            <span v-if="c.startTime">
            From
            <el-tag size="small">{{ c.startTime }}</el-tag>
            </span>
            <span v-if="c.endTime">
            To
            <el-tag size="small">{{ c.endTime }}</el-tag>
            </span>
            <span v-if="c.startTime&&c.endTime" style="margin-left: 10px">耗时：{{
                subTime(c.startTime, c.endTime)
              }}</span>
          </div>
        </template>
        <el-tabs v-model="deviceId" type="border-card" tab-position="left" @tab-click="switchDevice">
          <el-tab-pane v-for="d in deviceList" :name="d.id+''" lazy>
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
              <el-tab-pane label="运行日志" name="log" lazy>
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
                <div v-if="recordUrl.length>0" class="flex-center">
                  <video-play v-bind="videoOptions" :src="recordUrl"/>
                </div>
                <el-empty v-else description="暂无录像"></el-empty>
              </el-tab-pane>
            </el-tabs>
          </el-tab-pane>
        </el-tabs>
      </el-collapse-item>
    </el-collapse>
  </el-card>
</template>

<style scoped lang="less">
// 勿删，用于video-play组件样式穿透
.d-player-wrap {
  border-radius: 1.5rem;
}
</style>