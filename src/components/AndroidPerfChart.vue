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
import {useI18n} from 'vue-i18n';
import * as echarts from 'echarts/core';
import {
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent,
} from 'echarts/components';
import {LineChart} from 'echarts/charts';
import {CanvasRenderer} from 'echarts/renderers';
import {nextTick} from 'vue';

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

const {t: $t} = useI18n();
const props = defineProps({
  rid: String,
  cid: Number,
  did: Number,
  sysCpu: Array,
  sysMem: Array,
  sysNetwork: Array,
  procCpu: Array,
  procMem: Array,
  procFps: Array,
  procThread: Array,
});

function getTimeStr(timestamp) {
  const now = new Date(timestamp);
  const hour = now.getHours().toString().padStart(2, '0');
  const minute = now.getMinutes().toString().padStart(2, '0');
  const second = now.getSeconds().toString().padStart(2, '0');
  return `${hour}:${minute}:${second}`;
}

let signZoomStart = 30;
let signZoomEnd = 100;
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
        const obj = {top: 60};
        obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 5;
        return obj;
      },
      valueFormatter: (value) => `${value.toFixed(3)} %`,
    },
    legend: {
      top: '8%',
      data: sysCpuData.SingleCpuDataLegend,
    },
    grid: {top: '26%'},
    toolbox: {
      feature: {
        saveAsImage: {show: true, title: 'Save'},
      },
    },
    xAxis: {
      boundaryGap: false,
      type: 'category',
      data: sysCpuData.xAxisData,
    },
    dataZoom: [
      {
        show: true,
        realtime: true,
        start: signZoomStart,
        end: signZoomEnd,
        xAxisIndex: [0, 1],
      },
    ],
    yAxis: [{name: `${$t('perf.singleCpu')}(%)`, min: 0}],
    series: sysCpuData.SingleCpuData,
  };
  chart.on('dataZoom', (event) => {
    signZoomEnd = event.end
    signZoomStart = event.start
  })
  chart.setOption(option);
};

let sysCpuData = {
  xAxisData: [],
  seriesData: [],
  CpuDataLegend: [],
  SingleCpuData: [],
  SingleCpuDataLegend: [],
  zoomStart:30,
  zoomEnd:100,
}

const pushSysCpuData = (obj) => {
  sysCpuData.xAxisData.push(getTimeStr(obj.cpu.timeStamp))
  if (obj.cpu) {
    for (const i in obj.cpu) {
      if (i !== 'timeStamp') {
        if (sysCpuData[i]) {
          sysCpuData[i].data.push(obj.cpu[i])
        } else {
          sysCpuData[i] = {
            type: 'line',
            name: i,
            data: [obj.cpu[i]],
            showSymbol: false,
            areaStyle: {},
            boundaryGap: false,
          }
          sysCpuData.seriesData.push(sysCpuData[i])
          sysCpuData.CpuDataLegend.push(i)
        }
      }
    }
  }
  for (let i in obj) {
    if (sysCpuData[i]) {
      sysCpuData[i].data.push(obj[i].cpuUsage)
    } else {
      sysCpuData[i] = {
        type: 'line',
        name: i,
        data: [obj[i].cpuUsage],
        showSymbol: false,
        areaStyle: {},
        boundaryGap: false,
      }
      sysCpuData.SingleCpuData.push(sysCpuData[i])
      sysCpuData.SingleCpuDataLegend.push(i)
    }
  }
}

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
        const obj = {top: 60};
        obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 5;
        return obj;
      },
      valueFormatter: (value) => `${value.toFixed(3)} %`,
    },
    legend: {
      top: '8%',
      data: sysCpuData.CpuDataLegend,
    },
    grid: {top: '28%'},
    toolbox: {
      feature: {
        saveAsImage: {show: true, title: 'Save'},
      },
    },
    xAxis: {
      boundaryGap: false,
      type: 'category',
      data: sysCpuData.xAxisData,
    },
    dataZoom: [
      {
        show: true,
        realtime: true,
        start: sysCpuData.zoomStart,
        end: sysCpuData.zoomEnd,
        xAxisIndex: [0, 1],
      },
    ],
    yAxis: [{name: `${$t('perf.totalCpu')}(%)`, min: 0}],
    series: sysCpuData.seriesData,
  };
  chart.on('dataZoom', (event) => {
    sysCpuData.zoomEnd = event.end
    sysCpuData.zoomStart = event.start
  })
  chart.setOption(option);
};

let sysMemData = {
  xAxisData: [],
  memBuffersData: [],
  memCached: [],
  memFree: [],
  memTotal: [],
  swapFree: [],
  swapTotal: [],
  zoomStart:30,
  zoomEnd:100,
}

const pushSysMemData = (obj) => {
  sysMemData.xAxisData.push(getTimeStr(obj.timeStamp))
  sysMemData.memBuffersData.push(obj.memBuffers)
  sysMemData.memCached.push(obj.memCached)
  sysMemData.memCached.push(obj.memFree)
  sysMemData.memTotal.push(obj.memTotal)
  sysMemData.swapFree.push(obj.swapFree)
  sysMemData.swapTotal.push(obj.swapTotal)
}
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
      position(pos, params, dom, rect, size) {
        const obj = {top: 60};
        obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 5;
        return obj;
      },
      valueFormatter: (value) => `${value}`,
    },
    grid: {top: '30%', left: '20%'},
    toolbox: {
      feature: {
        saveAsImage: {show: true, title: 'Save'},
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
      data: sysMemData.xAxisData,
    },
    dataZoom: [
      {
        show: true,
        realtime: true,
        start: sysMemData.zoomStart,
        end: sysMemData.zoomEnd,
        xAxisIndex: [0, 1],
      },
    ],
    yAxis: [{name: `${$t('perf.memUsage')}(b)`, min: 0}],
    series: [
      {
        name: 'Mem Buffers',
        type: 'line',
        data: sysMemData.memBuffersData,
        showSymbol: false,
        boundaryGap: false,
      },
      {
        name: 'Mem Cached',
        type: 'line',
        data: sysMemData.memCached,
        showSymbol: false,
        boundaryGap: false,
      },
      {
        name: 'Mem Free',
        type: 'line',
        data: sysMemData.memFree,
        showSymbol: false,
        boundaryGap: false,
      },
      {
        name: 'Mem Total',
        type: 'line',
        data: sysMemData.memTotal,
        showSymbol: false,
        boundaryGap: false,
      },
      {
        name: 'Swap Free',
        type: 'line',
        data: sysMemData.swapFree,
        showSymbol: false,
        boundaryGap: false,
      },
      {
        name: 'Swap Total',
        type: 'line',
        data: sysMemData.swapTotal,
        showSymbol: false,
        boundaryGap: false,
      },
    ],
  };
  chart.on('dataZoom', (event) => {
    sysMemData.zoomEnd = event.end
    sysMemData.zoomStart = event.start
  })
  chart.setOption(option);
};

let procFPSData = {
  xAxisData: [],
  seriesData: [],
  zoomStart:30,
  zoomEnd:100,
}
const pushProcFPSData = (obj) => {
  procFPSData.xAxisData.push(getTimeStr(obj.timeStamp))
  procFPSData.seriesData.push(obj.fps)
}
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
    grid: {top: '15%'},
    toolbox: {
      feature: {
        saveAsImage: {show: true, title: 'Save'},
      },
    },
    xAxis: {
      data: procFPSData.xAxisData,
    },
    dataZoom: [
      {
        show: true,
        realtime: true,
        start: procFPSData.zoomStart,
        end: procFPSData.zoomEnd,
        xAxisIndex: [0, 1],
      },
    ],
    yAxis: [{name: 'FPS', min: 0}],
    series: [
      {
        type: 'line',
        data: procFPSData.seriesData,
        showSymbol: false,
      },
    ],
  };
  chart.on('dataZoom', (event) => {
    procFPSData.zoomEnd = event.end
    procFPSData.zoomStart = event.start
  })
  chart.setOption(option);
};

let procThreadData = {
  xAxisData: [],
  seriesData: [],
  zoomStart:30,
  zoomEnd:100,
}
const pushProcThreadData = (obj) => {
  console.log(obj)
  procThreadData.xAxisData.push(getTimeStr(obj.timeStamp))
  procThreadData.seriesData.push(obj.threadCount)
}


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
    grid: {top: '15%'},
    toolbox: {
      feature: {
        saveAsImage: {show: true, title: 'Save'},
      },
    },
    xAxis: {
      data: procThreadData.xAxisData,
    },
    dataZoom: [
      {
        show: true,
        realtime: true,
        start: procThreadData.zoomStart,
        end: procThreadData.zoomEnd,
        xAxisIndex: [0, 1],
      },
    ],
    yAxis: [{name: 'Count', min: 0}],
    series: [
      {
        type: 'line',
        data: procThreadData.seriesData,
        showSymbol: false,
      },
    ],
  };
  chart.on('dataZoom', (event) => {
    procThreadData.zoomEnd = event.end
    procThreadData.zoomStart = event.start
  })
  chart.setOption(option);
};

let sysNetworkData = {
  xAxisData: [],
  seriesData: [],
  legendData:[],
  zoomStart:30,
  zoomEnd:100,
}

const pushSysNetworkData = (obj) => {
  let isAddTime = true;
  for (const i in obj) {
    if (isAddTime) {
      sysNetworkData.xAxisData.push(getTimeStr(obj[i].timeStamp));
      isAddTime = false;
    }

    if (sysNetworkData[i + '_rx'] === undefined) {
      sysNetworkData[i + '_rx'] = {
        type: 'line',
        name: i + '_rx',
        data: [obj[i].rx],
        showSymbol: false,
        boundaryGap: false,
      }
      sysNetworkData[i + '_tx'] = {
        type: 'line',
        name: i + '_tx',
        data: [obj[i].tx],
        showSymbol: false,
        boundaryGap: false,
      }
      sysNetworkData.seriesData.push(sysNetworkData[i + '_rx']);
      sysNetworkData.seriesData.push(sysNetworkData[i + '_tx']);

      sysNetworkData.legendData.push(i + '_rx')
      sysNetworkData.legendData.push(i + '_tx')
    } else {
      sysNetworkData[i + '_rx'].data.push(obj[i].rx)
      sysNetworkData[i + '_tx'].data.push(obj[i].tx)
    }
  }
}

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
      position(pos, params, dom, rect, size) {
        const obj = {top: 60};
        obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 5;
        return obj;
      },
      valueFormatter: (value) => `${value}`,
    },
    legend: {
      top: '8%',
      data: sysNetworkData.legendData,
    },
    grid: {top: '20%', left: '18%'},
    toolbox: {
      feature: {
        saveAsImage: {show: true, title: 'Save'},
      },
    },
    xAxis: {
      data: sysNetworkData.xAxisData,
    },
    dataZoom: [
      {
        show: true,
        realtime: true,
        start: sysNetworkData.zoomStart,
        end: sysNetworkData.zoomEnd,
        xAxisIndex: [0, 1],
      },
    ],
    yAxis: [{name: `${$t('perf.network')}(b)`, min: 0}],
    series: sysNetworkData.seriesData,
  };
  chart.on('dataZoom', (event) => {
    sysNetworkData.zoomEnd = event.end
    sysNetworkData.zoomStart = event.start
  })
  chart.setOption(option);
};

let procCpuData = {
  xAxisData: [],
  seriesData: [],
  zoomStart:30,
  zoomEnd:100,
}
const pushProcCpuData = (obj) => {
  procCpuData.xAxisData.push(getTimeStr(obj.timeStamp))
  procCpuData.seriesData.push(obj.cpuUtilization)
}
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
    grid: {top: '15%'},
    toolbox: {
      feature: {
        saveAsImage: {show: true, title: 'Save'},
      },
    },
    xAxis: {
      boundaryGap: false,
      type: 'category',
      data: procCpuData.xAxisData,
    },
    dataZoom: [
      {
        show: true,
        realtime: true,
        start: procCpuData.zoomStart,
        end: procCpuData.zoomEnd,
        xAxisIndex: [0, 1],
      },
    ],
    yAxis: [{name: `${$t('perf.procCpu')}(%)`, min: 0}],
    series: [
      {
        type: 'line',
        data: procCpuData.seriesData,
        showSymbol: false,
        areaStyle: {},
        boundaryGap: false,
      },
    ],
  };
  chart.on('dataZoom', (event) => {
    procCpuData.zoomEnd = event.end
    procCpuData.zoomStart = event.start
  })
  chart.setOption(option);
};

let procMemData = {
  xAxisData: [],
  pssData: [],
  phyData: [],
  vmData: [],
  zoomStart:30,
  zoomEnd:100
}
const pushProcMemData = (obj) => {
  procMemData.xAxisData.push(getTimeStr(obj.timeStamp))
  procMemData.phyData.push(obj.phyRSS)
  procMemData.vmData.push(obj.vmRSS)
  procMemData.pssData.push(obj.totalPSS)
}
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
    grid: {top: '20%', left: '20%'},
    toolbox: {
      feature: {
        saveAsImage: {show: true, title: 'Save'},
      },
    },
    xAxis: {
      boundaryGap: false,
      type: 'category',
      data: procMemData.xAxisData,
    },
    dataZoom: [
      {
        show: true,
        realtime: true,
        start: procMemData.zoomStart,
        end: procMemData.zoomEnd,
        xAxisIndex: [0, 1],
      },
    ],
    legend: {
      top: '8%',
      data: ['Phy RSS', 'VM RSS', 'Total PSS'],
    },
    yAxis: [{name: `${$t('perf.memUsage')}(kb)`, min: 0}],
    series: [
      {
        name: 'Phy RSS',
        type: 'line',
        data: procMemData.phyData,
        showSymbol: false,
        boundaryGap: false,
      },
      {
        name: 'VM RSS',
        type: 'line',
        data: procMemData.vmData,
        showSymbol: false,
        boundaryGap: false,
      },
      {
        name: 'Total PSS',
        type: 'line',
        data: procMemData.pssData,
        showSymbol: false,
        boundaryGap: false,
      },
    ],
  };
  chart.on('dataZoom', (event) => {
    procMemData.zoomEnd = event.end
    procMemData.zoomStart = event.start
  })
  chart.setOption(option);
};

const clearPerf = () => {
  procMemData = {
    xAxisData: [],
    pssData: [],
    phyData: [],
    vmData: []
  };
  procCpuData = {
    xAxisData: [],
    seriesData: []
  };
  sysNetworkData = {
    xAxisData: [],
    seriesData: [],
    legendData:[]
  };
  procThreadData = {
    xAxisData: [],
    seriesData: []
  };
  procFPSData = {
    xAxisData: [],
    seriesData: []
  };
  sysMemData = {
    xAxisData: [],
    memBuffersData: [],
    memCached: [],
    memFree: [],
    memTotal: [],
    swapFree: [],
    swapTotal: [],
  };
  sysCpuData = {
    xAxisData: [],
    seriesData: [],
    CpuDataLegend: [],
    SingleCpuData: [],
    SingleCpuDataLegend: [],
  };
}
defineExpose({
  pushSysCpuData,
  printCpu,
  printSingleCpu,
  pushSysMemData,
  printMem,
  pushSysNetworkData,
  printNetwork,
  pushProcCpuData,
  printPerfCpu,
  pushProcMemData,
  printPerfMem,
  pushProcFPSData,
  printProcFps,
  pushProcThreadData,
  printProcThread,
  clearPerf,
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
                v-loading="sysCpu.length === 0"
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
                v-loading="sysCpu.length === 0"
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
                v-loading="sysMem.length === 0"
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
                v-loading="sysNetwork.length === 0"
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
                v-loading="procCpu.length === 0"
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
                v-loading="procMem.length === 0"
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
                v-loading="procFps.length === 0"
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
                v-loading="procThread.length === 0"
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
