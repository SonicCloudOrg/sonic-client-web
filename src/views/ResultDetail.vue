<script setup>
import { useRoute, useRouter } from 'vue-router';
import { nextTick, onMounted, onUnmounted, ref, reactive } from 'vue';
import 'vue3-video-play/dist/style.css';
import { videoPlay } from 'vue3-video-play';
import * as echarts from 'echarts/core';
import {
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from 'echarts/components';
import { LineChart, PieChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';
import StepLog from '../components/StepLog.vue';
import axios from '../http/axios';
import IOSPerfChart from '../components/IOSPerfChart.vue';

import AndroidPerfChart from '../components/AndroidPerfChart.vue';

const iosPerfChartMap = {};

const androidPerfChartMap = {};
const { t: $t } = useI18n();
echarts.use([
  PieChart,
  ToolboxComponent,
  GridComponent,
  LegendComponent,
  LineChart,
  CanvasRenderer,
  TitleComponent,
  TooltipComponent,
]);
const router = useRouter();
const route = useRoute();
const results = ref({});
const testCaseList = ref([]);
const deviceList = ref([]);
const caseId = ref(0);
const deviceId = ref('');
const stepList = ref([]);
const done = ref(false);
const stepLoading = ref(false);
const type = ref('log');
const recordUrl = ref('');
const videoOptions = reactive({
  width: '48%',
  height: 'auto',
  controlBtns: ['audioTrack', 'quality', 'volume', 'fullScreen', 'speedRate'],
});
let page = 1;
let resizeFun;
let resizeChart;
const subTime = (date1, date2) => {
  let data = (new Date(date2) - new Date(date1)) / 1000;
  let time = '';
  const days = parseInt(data / 86400);
  data %= 86400;
  const hours = parseInt(data / 3600);
  data %= 3600;
  const minutes = parseInt(data / 60);
  data %= 60;
  if (days > 0) {
    time =
      days +
      $t('projectIndexTS.code.day') +
      hours +
      $t('projectIndexTS.code.hour') +
      minutes +
      $t('projectIndexTS.code.minute') +
      data +
      $t('projectIndexTS.code.second');
  } else {
    time =
      hours +
      $t('projectIndexTS.code.hour') +
      minutes +
      $t('projectIndexTS.code.minute') +
      data +
      $t('projectIndexTS.code.second');
  }
  return time;
};
const changeCase = (e) => {
  if (e !== '') {
    page = 1;
    done.value = false;
    stepList.value = [];
    type.value = 'log';
    deviceList.value = [];
    for (const i in testCaseList.value) {
      if (testCaseList.value[i].case.id === e) {
        getDeviceList(testCaseList.value[i].device);
        break;
      }
    }
  }
};
const switchType = (e) => {
  if (e.props.name === 'perform') {
    nextTick(() => {
      getPerform();
    });
  }
  if (e.props.name === 'record') {
    nextTick(() => {
      getRecord();
    });
  }
};
const getRecord = () => {
  recordUrl.value = '';
  axios
    .get('/controller/resultDetail/listAll', {
      params: {
        caseId: caseId.value,
        resultId: route.params.resultId,
        deviceId: deviceId.value,
        type: 'record',
      },
    })
    .then((resp) => {
      if (resp.code === 2000 && resp.data.length > 0) {
        recordUrl.value = resp.data[0].log;
      }
    });
};
const cpu = ref([]);
const mem = ref([]);
const gpu = ref([]);
const fps = ref([]);
const disk = ref([]);
const network = ref([]);
const procPerf = ref([]);
const sysCpu = ref([]);
const sysMem = ref([]);
const sysNetwork = ref([]);
const procCpu = ref([]);
const procMem = ref([]);
const procFps = ref([]);
const procThread = ref([]);
const clearPerfmon = () => {
  cpu.value = [];
  mem.value = [];
  gpu.value = [];
  fps.value = [];
  disk.value = [];
  network.value = [];
  procPerf.value = [];
  sysCpu.value = [];
  sysMem.value = [];
  sysNetwork.value = [];
  procCpu.value = [];
  procMem.value = [];
  procFps.value = [];
  procThread.value = [];
};
const getPerform = () => {
  axios
    .get('/controller/resultDetail/listAll', {
      params: {
        caseId: caseId.value,
        resultId: route.params.resultId,
        deviceId: deviceId.value,
        type: 'perform',
      },
    })
    .then(async (resp) => {
      await clearPerfmon();
      for (const i in resp.data) {
        const r = JSON.parse(resp.data[i].log);
        if (r.type) {
          if (r.type === 'sys_cpu') {
            cpu.value.push(r);
          }
          if (r.type === 'sys_mem') {
            mem.value.push(r);
          }
          if (r.type === 'gpu') {
            gpu.value.push(r);
          }
          if (r.type === 'fps') {
            fps.value.push(r);
          }
          if (r.type === 'sys_disk') {
            disk.value.push(r);
          }
          if (r.type === 'sys_network') {
            network.value.push(r);
          }
          if (r.type === 'process') {
            procPerf.value.push(r);
          }
          const key = `${route.params.resultId}-${caseId.value}-${deviceId.value}-iosPerfChart`;
          iosPerfChartMap[key].printCpu();
          iosPerfChartMap[key].printMem();
          iosPerfChartMap[key].printGpu();
          iosPerfChartMap[key].printFps();
          iosPerfChartMap[key].printDisk();
          iosPerfChartMap[key].printNetwork();
          iosPerfChartMap[key].printPerfCpu();
          iosPerfChartMap[key].printPerfMem();
        } else {
          if (r.process) {
            if (r.process.cpuInfo) {
              procCpu.value.push(r.process.cpuInfo);
            }
            if (r.process.memInfo) {
              procMem.value.push(r.process.memInfo);
            }
            if (r.process.fpsInfo) {
              procFps.value.push(r.process.fpsInfo);
            }
            if (r.process.threadInfo) {
              procThread.value.push(r.process.threadInfo);
            }
          }
          if (r.system) {
            if (r.system.cpuInfo) {
              sysCpu.value.push(r.system.cpuInfo);
            }
            if (r.system.memInfo) {
              sysMem.value.push(r.system.memInfo);
            }
            if (r.system.networkInfo) {
              sysNetwork.value.push(r.system.networkInfo);
            }
          }
          const key = `${route.params.resultId}-${caseId.value}-${deviceId.value}-androidPerfChart`;
          androidPerfChartMap[key].printPerfCpu();
          androidPerfChartMap[key].printPerfMem();
          androidPerfChartMap[key].printProcFps();
          androidPerfChartMap[key].printProcThread();
          androidPerfChartMap[key].printCpu();
          androidPerfChartMap[key].printSingleCpu();
          androidPerfChartMap[key].printMem();
          androidPerfChartMap[key].printNetwork();
        }
      }
    });
};
const setRef = (el, key) => {
  if (el) {
    iosPerfChartMap[key] = el;
  }
};
const setAndroidRef = (el, key) => {
  if (el) {
    androidPerfChartMap[key] = el;
  }
};
const switchDevice = async (e) => {
  page = 1;
  done.value = false;
  stepList.value = [];
  type.value = 'log';
  await getStepList();
};
const loadMore = () => {
  page++;
  getStepList();
};
const getStepList = () => {
  stepLoading.value = true;
  axios
    .get('/controller/resultDetail/list', {
      params: {
        caseId: caseId.value,
        resultId: route.params.resultId,
        deviceId: deviceId.value,
        type: 'step',
        page,
      },
    })
    .then(async (resp) => {
      stepLoading.value = false;
      if (resp.code === 2000) {
        stepList.value.push(...resp.data.content);
        if (resp.data.totalPages === page) {
          done.value = true;
        }
      }
    });
};
const getDeviceList = (ids) => {
  const list = ids.map((obj) => {
    return obj.deviceId;
  });
  if (list.length > 0) {
    axios
      .get('/controller/devices/findByIdIn', {
        params: {
          ids: list,
        },
      })
      .then(async (resp) => {
        if (resp.code === 2000) {
          deviceList.value = resp.data;
          for (const i in ids) {
            for (const j in deviceList.value) {
              if (ids[i].deviceId === deviceList.value[j].id) {
                deviceList.value[j].status = ids[i].status;
              }
            }
          }
          if (deviceList.value.length > 0) {
            deviceId.value = `${deviceList.value[0].id}`;
            getStepList();
          }
        }
      });
  }
};
const getResultInfo = (id) => {
  axios.get('/controller/results', { params: { id } }).then(async (resp) => {
    if (resp.code === 2000) {
      results.value = resp.data;
      findCaseStatus(results.value.id);
    }
  });
};
const findCaseStatus = (id) => {
  let chart = echarts.getInstanceByDom(document.getElementById('chart'));
  if (chart == null) {
    chart = echarts.init(document.getElementById('chart'));
  }
  const option = {
    title: {
      text: $t('resultDetailTS.caseRun'),
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
    },
    legend: {
      orient: 'vertical',
      right: 'right',
    },
  };
  axios
    .get('/controller/results/findCaseStatus', { params: { id } })
    .then((resp) => {
      if (resp.code === 2000) {
        testCaseList.value = resp.data;
        const legend = [
          { value: 0, name: $t('resultDetailTS.noStart') },
          { value: 0, name: $t('projectIndexTS.code.pass') },
          { value: 0, name: $t('elements.warn') },
          { value: 0, name: $t('projectIndexTS.code.fail') },
          { value: 0, name: $t('resultDetailTS.runIng') },
        ];
        for (const i in testCaseList.value) {
          legend[testCaseList.value[i].status].value++;
        }
        chart.setOption({
          series: [
            {
              name: $t('resultDetailTS.caseStatus'),
              type: 'pie',
              radius: '50%',
              data: legend,
            },
          ],
        });
        chart.setOption(option);
        if (resizeChart !== undefined) {
          window.removeEventListener('resize', resizeChart);
        }
        resizeChart = () => {
          chart.resize();
        };
        window.addEventListener('resize', resizeChart);
        if (testCaseList.value.length > 0) {
          caseId.value = testCaseList.value[0].case.id;
          if (testCaseList.value[0].device.length > 0) {
            getDeviceList(testCaseList.value[0].device);
          }
        }
      }
    });
};
onMounted(() => {
  let chart = echarts.getInstanceByDom(document.getElementById('chart'));
  if (chart == null) {
    chart = echarts.init(document.getElementById('chart'));
  }
  chart.dispose();
  getResultInfo(route.params.resultId);
});
onUnmounted(() => {
  if (resizeChart !== undefined) {
    window.removeEventListener('resize', resizeChart);
  }
  if (resizeFun !== undefined) {
    window.removeEventListener('resize', resizeFun);
  }
});
</script>

<template>
  <el-page-header
    :content="$t('routes.reportDetails')"
    style="margin-bottom: 20px"
    @back="router.go(-1)"
  >
  </el-page-header>
  <el-row :gutter="20">
    <el-col :span="12">
      <el-card shadow="hover">
        <template #header
          ><strong>{{ $t('resultDetailTS.page.reportInfo') }}</strong></template
        >
        <el-form
          v-if="results['id']"
          label-position="left"
          class="demo-table-expand"
          label-width="120px"
          style="margin-left: 10px; word-break: break-all"
        >
          <el-form-item :label="$t('resultDetailTS.page.resultId')">
            <span>{{ results['id'] }}</span>
          </el-form-item>
          <el-form-item :label="$t('routes.testSuite')">
            <span>{{ results['suiteName'] }}</span>
          </el-form-item>
          <el-form-item :label="$t('resultDetailTS.page.executeUser')">
            <el-tag v-if="results['strike'] === 'SYSTEM'" size="small"
              >{{ $t('routes.timedTask') }}
            </el-tag>
            <span v-else>{{ results['strike'] }}</span>
          </el-form-item>
          <el-form-item :label="$t('resultDetailTS.page.runStatus')">
            <el-tag v-if="results['status'] === 1" type="success" size="small"
              >{{ $t('resultDetailTS.page.testPass') }}
            </el-tag>
            <el-tag v-if="results['status'] === 0" type="info" size="small"
              ><i class="el-icon-loading"></i> {{ $t('resultDetailTS.runIng') }}
            </el-tag>
            <el-tag v-if="results['status'] === 3" type="danger" size="small">
              {{ $t('resultDetailTS.page.testFail') }}
            </el-tag>
            <el-tag v-if="results['status'] === 2" type="warning" size="small"
              >{{ $t('resultDetailTS.page.testAlert') }}
            </el-tag>
          </el-form-item>
          <el-form-item :label="$t('packagesTS.creatTime')">
            <span>{{ results['createTime'] }}</span>
          </el-form-item>
          <el-form-item :label="$t('resultDetailTS.page.endTime')">
            <span v-if="results['endTime']">{{ results['endTime'] }}</span>
            <span v-else>{{ $t('form.unknown') }}</span>
          </el-form-item>
          <el-form-item :label="$t('resultDetailTS.page.totalTime')">
            <span v-if="results['endTime']">{{
              subTime(results['createTime'], results['endTime'])
            }}</span>
            <span v-else>{{ $t('form.unknown') }}</span>
          </el-form-item>
        </el-form>
      </el-card>
    </el-col>
    <el-col :span="12">
      <el-card shadow="hover">
        <div id="chart" style="width: 100%; height: 338px"></div>
      </el-card>
    </el-col>
  </el-row>
  <el-divider
    ><span style="color: #909399">{{
      $t('resultDetailTS.page.runInfo')
    }}</span></el-divider
  >
  <el-card shadow="hover">
    <el-collapse v-model="caseId" accordion @change="changeCase">
      <el-collapse-item
        v-for="c in testCaseList"
        :key="c"
        :name="c['case'].id"
        style="position: relative"
      >
        <template #title>
          {{ $t('homeTS.testCase.case') }}：<strong style="color: #606266">{{
            c['case'].name
          }}</strong>
          <el-tag
            style="margin-left: 10px"
            size="small"
            :type="
              c.status === 1
                ? 'success'
                : c.status === 2
                ? 'warning'
                : c.status === 3
                ? 'danger'
                : 'info'
            "
          >
            <i
              v-if="c.status === 4"
              class="el-icon-loading"
              style="margin-right: 5px"
            />{{
              c.status === 0
                ? $t('resultDetailTS.noStart')
                : c.status === 1
                ? $t('projectIndexTS.code.pass')
                : c.status === 2
                ? $t('elements.warn')
                : c.status === 3
                ? $t('projectIndexTS.code.fail')
                : $t('resultDetailTS.runIng')
            }}
          </el-tag>
          <div style="position: absolute; right: 30px; color: #606266">
            <span v-if="c.startTime">
              From
              <el-tag size="small">{{ c.startTime }}</el-tag>
            </span>
            <span v-if="c.endTime">
              To
              <el-tag size="small">{{ c.endTime }}</el-tag>
            </span>
            <span v-if="c.startTime && c.endTime" style="margin-left: 10px"
              >{{ $t('resultDetailTS.page.total') }}：{{
                subTime(c.startTime, c.endTime)
              }}</span
            >
          </div>
        </template>
        <el-tabs
          v-model="deviceId"
          type="border-card"
          tab-position="left"
          @tab-click="switchDevice"
        >
          <el-tab-pane v-for="d in deviceList" :name="d.id + ''" lazy>
            <template #label>
              <div class="flex-center">
                {{ d.model }}
                <el-tag
                  style="margin-left: 10px"
                  size="small"
                  :type="
                    d.status === 1
                      ? 'success'
                      : d.status === 2
                      ? 'warning'
                      : d.status === 3
                      ? 'danger'
                      : 'info'
                  "
                >
                  <i
                    v-if="d.status === 4"
                    class="el-icon-loading"
                    style="margin-right: 5px"
                  />{{
                    d.status === 1
                      ? $t('projectIndexTS.code.pass')
                      : d.status === 2
                      ? $t('elements.warn')
                      : d.status === 3
                      ? $t('projectIndexTS.code.fail')
                      : $t('resultDetailTS.runIng')
                  }}
                </el-tag>
              </div>
            </template>
            <el-tabs v-model="type" type="border-card" @tab-click="switchType">
              <el-tab-pane
                :label="$t('resultDetailTS.page.runLog')"
                name="log"
                lazy
              >
                <step-log
                  :is-done="done"
                  :is-read-only="true"
                  :debug-loading="stepLoading"
                  :step-log="stepList"
                  @loadMore="loadMore"
                />
              </el-tab-pane>
              <el-tab-pane
                :label="$t('resultDetailTS.page.performanceInfo')"
                name="perform"
              >
                <android-perf-chart
                  v-if="d.platform === 1"
                  :ref="
                    (el) =>
                      setAndroidRef(
                        el,
                        route.params.resultId +
                          '-' +
                          c['case'].id +
                          '-' +
                          d.id +
                          '-' +
                          'androidPerfChart'
                      )
                  "
                  :cid="c['case'].id"
                  :rid="route.params.resultId"
                  :did="d.id"
                  :sys-cpu="sysCpu"
                  :sys-mem="sysMem"
                  :sys-network="sysNetwork"
                  :proc-cpu="procCpu"
                  :proc-mem="procMem"
                  :proc-fps="procFps"
                  :proc-thread="procThread"
                />
                <i-o-s-perf-chart
                  v-if="d.platform === 2"
                  :ref="
                    (el) =>
                      setRef(
                        el,
                        route.params.resultId +
                          '-' +
                          c['case'].id +
                          '-' +
                          d.id +
                          '-' +
                          'iosPerfChart'
                      )
                  "
                  :cid="c['case'].id"
                  :rid="route.params.resultId"
                  :did="d.id"
                  :cpu="cpu"
                  :mem="mem"
                  :fps="fps"
                  :gpu="gpu"
                  :disk="disk"
                  :network="network"
                  :proc-perf="procPerf"
                />
              </el-tab-pane>
              <el-tab-pane
                :label="$t('resultDetailTS.page.runRecording')"
                name="record"
              >
                <div v-if="recordUrl.length > 0" class="flex-center">
                  <video-play v-bind="videoOptions" :src="recordUrl" />
                </div>
                <el-empty
                  v-else
                  :description="$t('resultDetailTS.page.onRecording')"
                ></el-empty>
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
