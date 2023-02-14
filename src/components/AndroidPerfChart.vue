<script setup>
/*
 *   sonic-client-web  Front end of Sonic cloud real machine platform.
 *   Copyright (C) 2022 SonicCloudOrg
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU Affero General Public License as published
 *   by the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU Affero General Public License for more details.
 *
 *   You should have received a copy of the GNU Affero General Public License
 *   along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import moment from 'moment/moment';
import { useI18n } from 'vue-i18n';
import * as echarts from 'echarts/core';
import {
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent,
} from 'echarts/components';
import { LineChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { nextTick } from 'vue';

echarts.use([
  DataZoomComponent,
  ToolboxComponent,
  GridComponent,
  LegendComponent,
  LineChart,
  CanvasRenderer,
  TitleComponent,
  TooltipComponent,
]);

const { t: $t } = useI18n();
const props = defineProps({
  rid: String,
  cid: Number,
  did: Number,
  sysPerf: Array,
  procPerf: Array,
});
const printSystem = () => {
  printCpu();
  printSingleCpu();
  printMem();
  printNetwork();
};
const printProcess = () => {
  printPerfCpu();
  printProcThread();
  printPerfMem();
  printProcFps();
};
const getNetworkDataGroup = () => {
  const result = [];
  const rx = [];
  const tx = [];
  for (const i in props.sysPerf) {
    for (const j in props.sysPerf[i].networkInfo) {
      rx.push(props.sysPerf[i].networkInfo[j].rx);
      tx.push(props.sysPerf[i].networkInfo[j].tx);
      break;
    }
  }
  result.push({
    type: 'line',
    name: 'tx',
    data: tx,
    showSymbol: false,
    boundaryGap: false,
  });
  result.push({
    type: 'line',
    name: 'rx',
    data: rx,
    showSymbol: false,
    boundaryGap: false,
  });
  return result;
};
const getCpuDataGroup = () => {
  const result = [];
  for (const i in props.sysPerf) {
    if (props.sysPerf[i].cpuInfo) {
      for (const j in props.sysPerf[i].cpuInfo.cpu) {
        result.push({
          type: 'line',
          name: j,
          data: props.sysPerf.map((obj) => {
            if (obj.cpuInfo) {
              return obj.cpuInfo.cpu[j];
            }
            return 0;
          }),
          showSymbol: false,
          areaStyle: {},
          boundaryGap: false,
        });
      }
      break;
    }
  }
  return result;
};
const getCpuDataLegend = () => {
  const result = [];
  for (const i in props.sysPerf) {
    if (props.sysPerf[i].cpuInfo) {
      for (const j in props.sysPerf[i].cpuInfo.cpu) {
        result.push(j);
      }
      break;
    }
  }
  return result;
};
const getCpuLegend = () => {
  const result = [];
  for (const i in props.sysPerf) {
    if (props.sysPerf[i].cpuInfo) {
      for (const j in props.sysPerf[i].cpuInfo) {
        if (j !== 'cpu') {
          result.push(j);
        }
      }
      break;
    }
  }
  return result;
};
const getCpuGroup = () => {
  const result = [];
  for (const i in props.sysPerf) {
    if (props.sysPerf[i].cpuInfo) {
      for (const j in props.sysPerf[i].cpuInfo) {
        if (j !== 'cpu') {
          result.push({
            type: 'line',
            name: j,
            data: props.sysPerf.map((obj) => {
              if (obj.cpuInfo) {
                return obj.cpuInfo[j].cpuUsage;
              }
              return 0;
            }),
            showSymbol: false,
            areaStyle: {},
            boundaryGap: false,
          });
        }
      }
      break;
    }
  }
  return result;
};
const printSingleCpu = () => {
  let chart = echarts.getInstanceByDom(
    document.getElementById(
      `${props.rid}-${props.cid}-${props.did}-` + `sysSingleCpuChart`
    )
  );
  if (chart == null) {
    chart = echarts.init(
      document.getElementById(
        `${props.rid}-${props.cid}-${props.did}-` + `sysSingleCpuChart`
      )
    );
  }
  chart.resize();
  const option = {
    title: {
      text: 'System Single-Core CPU',
      textStyle: {
        color: '#606266',
      },
      x: 'center',
      y: 'top',
    },
    tooltip: {
      trigger: 'axis',
      position(pos, params, dom, rect, size) {
        const obj = { top: 60 };
        obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 5;
        return obj;
      },
      valueFormatter: (value) => `${value.toFixed(3)} %`,
    },
    legend: {
      top: '8%',
      data: getCpuLegend(),
    },
    grid: { top: '26%' },
    toolbox: {
      feature: {
        saveAsImage: { show: true, title: 'Save' },
      },
    },
    xAxis: {
      boundaryGap: false,
      type: 'category',
      data: props.sysPerf.map((obj) => {
        return moment(new Date(obj.timeStamp * 1000)).format('HH:mm:ss');
      }),
    },
    dataZoom: [
      {
        show: true,
        realtime: true,
        start: 30,
        end: 100,
        xAxisIndex: [0, 1],
      },
    ],
    yAxis: [{ name: `${$t('perf.singleCpu')}(%)`, min: 0 }],
    series: getCpuGroup(),
  };
  chart.setOption(option);
};
const printCpu = () => {
  let chart = echarts.getInstanceByDom(
    document.getElementById(
      `${props.rid}-${props.cid}-${props.did}-` + `sysCpuChart`
    )
  );
  if (chart == null) {
    chart = echarts.init(
      document.getElementById(
        `${props.rid}-${props.cid}-${props.did}-` + `sysCpuChart`
      )
    );
  }
  chart.resize();
  const option = {
    title: {
      text: 'System Total CPU',
      textStyle: {
        color: '#606266',
      },
      x: 'center',
      y: 'top',
    },
    tooltip: {
      trigger: 'axis',
      position(pos, params, dom, rect, size) {
        const obj = { top: 60 };
        obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 5;
        return obj;
      },
      valueFormatter: (value) => `${value.toFixed(3)} %`,
    },
    legend: {
      top: '8%',
      data: getCpuDataLegend(),
    },
    grid: { top: '28%' },
    toolbox: {
      feature: {
        saveAsImage: { show: true, title: 'Save' },
      },
    },
    xAxis: {
      boundaryGap: false,
      type: 'category',
      data: props.sysPerf.map((obj) => {
        return moment(new Date(obj.timeStamp * 1000)).format('HH:mm:ss');
      }),
    },
    dataZoom: [
      {
        show: true,
        realtime: true,
        start: 30,
        end: 100,
        xAxisIndex: [0, 1],
      },
    ],
    yAxis: [{ name: `${$t('perf.totalCpu')}(%)`, min: 0 }],
    series: getCpuDataGroup(),
  };
  chart.setOption(option);
};
const printMem = () => {
  let chart = echarts.getInstanceByDom(
    document.getElementById(
      `${props.rid}-${props.cid}-${props.did}-` + `sysMemChart`
    )
  );
  if (chart == null) {
    chart = echarts.init(
      document.getElementById(
        `${props.rid}-${props.cid}-${props.did}-` + `sysMemChart`
      )
    );
  }
  chart.resize();
  const option = {
    color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#409EFF'],
    title: {
      text: 'System Memory',
      textStyle: {
        color: '#606266',
      },
      x: 'center',
      y: 'top',
    },
    tooltip: {
      trigger: 'axis',
    },
    grid: { top: '30%', left: '20%' },
    toolbox: {
      feature: {
        saveAsImage: { show: true, title: 'Save' },
      },
    },
    legend: {
      top: '8%',
      data: [
        'Mem Buffers',
        'Mem Cached',
        'Mem Free',
        'Mem Total',
        'Swap Free',
        'Swap Total',
      ],
    },
    xAxis: {
      boundaryGap: false,
      type: 'category',
      data: props.sysPerf.map((obj) => {
        return moment(new Date(obj.timeStamp * 1000)).format('HH:mm:ss');
      }),
    },
    dataZoom: [
      {
        show: true,
        realtime: true,
        start: 30,
        end: 100,
        xAxisIndex: [0, 1],
      },
    ],
    yAxis: [{ name: `${$t('perf.memUsage')}(b)`, min: 0 }],
    series: [
      {
        name: 'Mem Buffers',
        type: 'line',
        data: props.sysPerf.map((obj) => {
          return obj.memInfo.memBuffers;
        }),
        showSymbol: false,
        boundaryGap: false,
      },
      {
        name: 'Mem Cached',
        type: 'line',
        data: props.sysPerf.map((obj) => {
          return obj.memInfo.memCached;
        }),
        showSymbol: false,
        boundaryGap: false,
      },
      {
        name: 'Mem Free',
        type: 'line',
        data: props.sysPerf.map((obj) => {
          return obj.memInfo.memFree;
        }),
        showSymbol: false,
        boundaryGap: false,
      },
      {
        name: 'Mem Total',
        type: 'line',
        data: props.sysPerf.map((obj) => {
          return obj.memInfo.memTotal;
        }),
        showSymbol: false,
        boundaryGap: false,
      },
      {
        name: 'Swap Free',
        type: 'line',
        data: props.sysPerf.map((obj) => {
          return obj.memInfo.swapFree;
        }),
        showSymbol: false,
        boundaryGap: false,
      },
      {
        name: 'Swap Total',
        type: 'line',
        data: props.sysPerf.map((obj) => {
          return obj.memInfo.swapTotal;
        }),
        showSymbol: false,
        boundaryGap: false,
      },
    ],
  };
  chart.setOption(option);
};
const printProcFps = () => {
  let chart = echarts.getInstanceByDom(
    document.getElementById(
      `${props.rid}-${props.cid}-${props.did}-` + `sysFpsChart`
    )
  );
  if (chart == null) {
    chart = echarts.init(
      document.getElementById(
        `${props.rid}-${props.cid}-${props.did}-` + `sysFpsChart`
      )
    );
  }
  chart.resize();
  const option = {
    color: ['#67C23A'],
    title: {
      text: 'Process FPS',
      textStyle: {
        color: '#606266',
      },
      x: 'center',
      y: 'top',
    },
    tooltip: {
      trigger: 'axis',
    },
    grid: { top: '15%' },
    toolbox: {
      feature: {
        saveAsImage: { show: true, title: 'Save' },
      },
    },
    xAxis: {
      data: props.procPerf.map((obj) => {
        return moment(new Date(obj.timeStamp * 1000)).format('HH:mm:ss');
      }),
    },
    dataZoom: [
      {
        show: true,
        realtime: true,
        start: 30,
        end: 100,
        xAxisIndex: [0, 1],
      },
    ],
    yAxis: [{ name: 'FPS', min: 0 }],
    series: [
      {
        type: 'line',
        data: props.procPerf.map((obj) => {
          return obj.fps;
        }),
        showSymbol: false,
      },
    ],
  };
  chart.setOption(option);
};
const printProcThread = () => {
  let chart = echarts.getInstanceByDom(
    document.getElementById(
      `${props.rid}-${props.cid}-${props.did}-` + `procThreadChart`
    )
  );
  if (chart == null) {
    chart = echarts.init(
      document.getElementById(
        `${props.rid}-${props.cid}-${props.did}-` + `procThreadChart`
      )
    );
  }
  chart.resize();
  const option = {
    color: ['#ee6666'],
    title: {
      text: 'Process Thread Count',
      textStyle: {
        color: '#606266',
      },
      x: 'center',
      y: 'top',
    },
    tooltip: {
      trigger: 'axis',
    },
    grid: { top: '15%' },
    toolbox: {
      feature: {
        saveAsImage: { show: true, title: 'Save' },
      },
    },
    xAxis: {
      data: props.procPerf.map((obj) => {
        return moment(new Date(obj.timeStamp * 1000)).format('HH:mm:ss');
      }),
    },
    dataZoom: [
      {
        show: true,
        realtime: true,
        start: 30,
        end: 100,
        xAxisIndex: [0, 1],
      },
    ],
    yAxis: [{ name: 'Count', min: 0 }],
    series: [
      {
        type: 'line',
        data: props.procPerf.map((obj) => {
          return obj.threadCount;
        }),
        showSymbol: false,
      },
    ],
  };
  chart.setOption(option);
};
const printNetwork = () => {
  let chart = echarts.getInstanceByDom(
    document.getElementById(
      `${props.rid}-${props.cid}-${props.did}-` + `sysNetworkChart`
    )
  );
  if (chart == null) {
    chart = echarts.init(
      document.getElementById(
        `${props.rid}-${props.cid}-${props.did}-` + `sysNetworkChart`
      )
    );
  }
  chart.resize();
  const option = {
    color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#409EFF'],
    title: {
      text: 'System Network',
      textStyle: {
        color: '#606266',
      },
      x: 'center',
      y: 'top',
    },
    tooltip: {
      trigger: 'axis',
    },
    grid: { top: '20%', left: '18%' },
    toolbox: {
      feature: {
        saveAsImage: { show: true, title: 'Save' },
      },
    },
    xAxis: {
      data: props.sysPerf.map((obj) => {
        return moment(new Date(obj.timeStamp * 1000)).format('HH:mm:ss');
      }),
    },
    dataZoom: [
      {
        show: true,
        realtime: true,
        start: 30,
        end: 100,
        xAxisIndex: [0, 1],
      },
    ],
    yAxis: [{ name: `${$t('perf.network')}(b)`, min: 0 }],
    series: getNetworkDataGroup(),
  };
  chart.setOption(option);
};
const printPerfCpu = () => {
  let chart = echarts.getInstanceByDom(
    document.getElementById(
      `${props.rid}-${props.cid}-${props.did}-` + `perfCpuChart`
    )
  );
  if (chart == null) {
    chart = echarts.init(
      document.getElementById(
        `${props.rid}-${props.cid}-${props.did}-` + `perfCpuChart`
      )
    );
  }
  chart.resize();
  const option = {
    title: {
      text: 'Process CPU',
      textStyle: {
        color: '#606266',
      },
      x: 'center',
      y: 'top',
    },
    tooltip: {
      trigger: 'axis',
      valueFormatter: (value) => `${value.toFixed(3)} %`,
    },
    grid: { top: '15%' },
    toolbox: {
      feature: {
        saveAsImage: { show: true, title: 'Save' },
      },
    },
    xAxis: {
      boundaryGap: false,
      type: 'category',
      data: props.procPerf.map((obj) => {
        return moment(new Date(obj.timeStamp * 1000)).format('HH:mm:ss');
      }),
    },
    dataZoom: [
      {
        show: true,
        realtime: true,
        start: 30,
        end: 100,
        xAxisIndex: [0, 1],
      },
    ],
    yAxis: [{ name: `${$t('perf.procCpu')}(%)`, min: 0 }],
    series: [
      {
        type: 'line',
        data: props.procPerf.map((obj) => {
          return obj.cpuUtilization;
        }),
        showSymbol: false,
        areaStyle: {},
        boundaryGap: false,
      },
    ],
  };
  chart.setOption(option);
};
const printPerfMem = () => {
  let chart = echarts.getInstanceByDom(
    document.getElementById(
      `${props.rid}-${props.cid}-${props.did}-` + `perfMemChart`
    )
  );
  if (chart == null) {
    chart = echarts.init(
      document.getElementById(
        `${props.rid}-${props.cid}-${props.did}-` + `perfMemChart`
      )
    );
  }
  chart.resize();
  const option = {
    color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#409EFF'],
    title: {
      text: 'Process Memory',
      textStyle: {
        color: '#606266',
      },
      x: 'center',
      y: 'top',
    },
    tooltip: {
      trigger: 'axis',
    },
    grid: { top: '20%', left: '20%' },
    toolbox: {
      feature: {
        saveAsImage: { show: true, title: 'Save' },
      },
    },
    xAxis: {
      boundaryGap: false,
      type: 'category',
      data: props.procPerf.map((obj) => {
        return moment(new Date(obj.timeStamp * 1000)).format('HH:mm:ss');
      }),
    },
    dataZoom: [
      {
        show: true,
        realtime: true,
        start: 30,
        end: 100,
        xAxisIndex: [0, 1],
      },
    ],
    legend: {
      top: '8%',
      data: ['Phy RSS', 'VM RSS', 'Total PSS'],
    },
    yAxis: [{ name: `${$t('perf.memUsage')}(b)`, min: 0 }],
    series: [
      {
        name: 'Phy RSS',
        type: 'line',
        data: props.procPerf.map((obj) => {
          return obj.phyRSS;
        }),
        showSymbol: false,
        boundaryGap: false,
      },
      {
        name: 'VM RSS',
        type: 'line',
        data: props.procPerf.map((obj) => {
          return obj.vmRSS;
        }),
        showSymbol: false,
        boundaryGap: false,
      },
      {
        name: 'Total PSS',
        type: 'line',
        data: props.procPerf.map((obj) => {
          return obj.totalPSS;
        }),
        showSymbol: false,
        boundaryGap: false,
      },
    ],
  };
  chart.setOption(option);
};
defineExpose({
  printSystem,
  printProcess,
});
const switchTab = (e) => {
  if (e.index == 1) {
    nextTick(() => {
      const memChart = echarts.getInstanceByDom(
        document.getElementById(
          `${props.rid}-${props.cid}-${props.did}-` + `perfMemChart`
        )
      );
      memChart.resize();
      const cpuChart = echarts.getInstanceByDom(
        document.getElementById(
          `${props.rid}-${props.cid}-${props.did}-` + `perfCpuChart`
        )
      );
      cpuChart.resize();
      const fpsChart = echarts.getInstanceByDom(
        document.getElementById(
          `${props.rid}-${props.cid}-${props.did}-` + `sysFpsChart`
        )
      );
      fpsChart.resize();
      const threadChart = echarts.getInstanceByDom(
        document.getElementById(
          `${props.rid}-${props.cid}-${props.did}-` + `procThreadChart`
        )
      );
      threadChart.resize();
    });
  } else {
    nextTick(() => {
      const memChart = echarts.getInstanceByDom(
        document.getElementById(
          `${props.rid}-${props.cid}-${props.did}-` + `sysMemChart`
        )
      );
      memChart.resize();
      const cpuChart = echarts.getInstanceByDom(
        document.getElementById(
          `${props.rid}-${props.cid}-${props.did}-` + `sysSingleCpuChart`
        )
      );
      cpuChart.resize();
      const cpuChart2 = echarts.getInstanceByDom(
        document.getElementById(
          `${props.rid}-${props.cid}-${props.did}-` + `sysCpuChart`
        )
      );
      cpuChart2.resize();
      const networkChart = echarts.getInstanceByDom(
        document.getElementById(
          `${props.rid}-${props.cid}-${props.did}-` + `sysNetworkChart`
        )
      );
      networkChart.resize();
    });
  }
};
</script>

<template>
  <el-tabs
    style="margin-top: 10px"
    stretch
    type="border-card"
    @tab-click="switchTab"
  >
    <el-tab-pane label="System PerfMon">
      <el-row :gutter="10">
        <el-col :span="12">
          <el-card style="margin-top: 10px">
            <div
              :id="rid + '-' + cid + '-' + did + '-' + 'sysSingleCpuChart'"
              v-loading="sysPerf.length === 0"
              :element-loading-text="$t('perf.emptyData')"
              element-loading-spinner="el-icon-box"
              style="width: 100%; height: 350px"
            ></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card style="margin-top: 10px">
            <div
              :id="rid + '-' + cid + '-' + did + '-' + 'sysCpuChart'"
              v-loading="sysPerf.length === 0"
              :element-loading-text="$t('perf.emptyData')"
              element-loading-spinner="el-icon-box"
              style="width: 100%; height: 350px"
            ></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card style="margin-top: 10px">
            <div
              :id="rid + '-' + cid + '-' + did + '-' + 'sysMemChart'"
              v-loading="sysPerf.length === 0"
              :element-loading-text="$t('perf.emptyData')"
              element-loading-spinner="el-icon-box"
              style="width: 100%; height: 350px"
            ></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card style="margin-top: 10px">
            <div
              :id="rid + '-' + cid + '-' + did + '-' + 'sysNetworkChart'"
              v-loading="sysPerf.length === 0"
              :element-loading-text="$t('perf.emptyData')"
              element-loading-spinner="el-icon-box"
              style="width: 100%; height: 350px"
            ></div>
          </el-card>
        </el-col>
      </el-row>
    </el-tab-pane>
    <el-tab-pane label="Process PerfMon">
      <el-row :gutter="10">
        <el-col :span="12">
          <el-card style="margin-top: 10px">
            <div
              :id="rid + '-' + cid + '-' + did + '-' + 'perfCpuChart'"
              v-loading="procPerf.length === 0"
              :element-loading-text="$t('perf.emptyData')"
              element-loading-spinner="el-icon-box"
              style="width: 100%; height: 350px"
            ></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card style="margin-top: 10px">
            <div
              :id="rid + '-' + cid + '-' + did + '-' + 'perfMemChart'"
              v-loading="procPerf.length === 0"
              :element-loading-text="$t('perf.emptyData')"
              element-loading-spinner="el-icon-box"
              style="width: 100%; height: 350px"
            ></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card style="margin-top: 10px">
            <div
              :id="rid + '-' + cid + '-' + did + '-' + 'sysFpsChart'"
              v-loading="procPerf.length === 0"
              :element-loading-text="$t('perf.emptyData')"
              element-loading-spinner="el-icon-box"
              style="width: 100%; height: 350px"
            ></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card style="margin-top: 10px">
            <div
              :id="rid + '-' + cid + '-' + did + '-' + 'procThreadChart'"
              v-loading="procPerf.length === 0"
              :element-loading-text="$t('perf.emptyData')"
              element-loading-spinner="el-icon-box"
              style="width: 100%; height: 350px"
            ></div>
          </el-card>
        </el-col>
      </el-row>
    </el-tab-pane>
  </el-tabs>
</template>
