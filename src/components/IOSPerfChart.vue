<script setup>
import moment from 'moment/moment';
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

const props = defineProps({
  rid: Number,
  cid: Number,
  did: Number,
  cpu: Array,
  mem: Array,
  gpu: Array,
  fps: Array,
  disk: Array,
  network: Array,
  procPerf: Array,
});
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
      text: 'System CPU',
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
      boundaryGap: false,
      type: 'category',
      data: props.cpu.map((obj) => {
        return moment(new Date(obj.timestamp * 1000)).format('HH:mm:ss');
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
    yAxis: [{ name: 'CPU使用率(%)', min: 0 }],
    series: [
      {
        type: 'line',
        data: props.cpu.map((obj) => {
          return obj.total_load;
        }),
        showSymbol: false,
        areaStyle: {},
        boundaryGap: false,
      },
    ],
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
    grid: { top: '30%', left: '13%' },
    toolbox: {
      feature: {
        saveAsImage: { show: true, title: 'Save' },
      },
    },
    legend: {
      top: '8%',
      data: [
        'App Memory',
        'Free Memory',
        'Cached Files',
        'Compressed',
        'Used Memory',
        'Wired Memory',
      ],
    },
    xAxis: {
      boundaryGap: false,
      type: 'category',
      data: props.mem.map((obj) => {
        return moment(new Date(obj.timestamp * 1000)).format('HH:mm:ss');
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
    yAxis: [{ name: '内存占用(b)', min: 0 }],
    series: [
      {
        name: 'App Memory',
        type: 'line',
        data: props.mem.map((obj) => {
          return obj.app_memory;
        }),
        showSymbol: false,
        areaStyle: {},
        boundaryGap: false,
      },
      {
        name: 'Free Memory',
        type: 'line',
        data: props.mem.map((obj) => {
          return obj.free_memory;
        }),
        showSymbol: false,
        areaStyle: {},
        boundaryGap: false,
      },
      {
        name: 'Cached Files',
        type: 'line',
        data: props.mem.map((obj) => {
          return obj.cached_files;
        }),
        showSymbol: false,
        areaStyle: {},
        boundaryGap: false,
      },
      {
        name: 'Compressed',
        type: 'line',
        data: props.mem.map((obj) => {
          return obj.compressed;
        }),
        showSymbol: false,
        areaStyle: {},
        boundaryGap: false,
      },
      {
        name: 'Used Memory',
        type: 'line',
        data: props.mem.map((obj) => {
          return obj.used_memory;
        }),
        showSymbol: false,
        areaStyle: {},
        boundaryGap: false,
      },
      {
        name: 'Wired Memory',
        type: 'line',
        data: props.mem.map((obj) => {
          return obj.wired_memory;
        }),
        showSymbol: false,
        areaStyle: {},
        boundaryGap: false,
      },
    ],
  };
  chart.setOption(option);
};
const printGpu = () => {
  let chart = echarts.getInstanceByDom(
    document.getElementById(
      `${props.rid}-${props.cid}-${props.did}-` + `sysGpuChart`
    )
  );
  if (chart == null) {
    chart = echarts.init(
      document.getElementById(
        `${props.rid}-${props.cid}-${props.did}-` + `sysGpuChart`
      )
    );
  }
  chart.resize();
  const option = {
    color: ['#5470c6', '#91cc75', '#ee6666'],
    title: {
      text: 'System GPU',
      textStyle: {
        color: '#606266',
      },
      x: 'center',
      y: 'top',
    },
    tooltip: {
      trigger: 'axis',
    },
    grid: { top: '25%' },
    toolbox: {
      feature: {
        saveAsImage: { show: true, title: 'Save' },
      },
    },
    legend: {
      top: '8%',
      data: ['Device Utilization', 'Renderer Utilization', 'Tiler Utilization'],
    },
    xAxis: {
      data: props.gpu.map((obj) => {
        return moment(new Date(obj.timestamp * 1000)).format('HH:mm:ss');
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
    yAxis: [{ name: '利用率(%)', min: 0 }],
    series: [
      {
        name: 'Device Utilization',
        type: 'line',
        data: props.gpu.map((obj) => {
          return obj.device_utilization;
        }),
      },
      {
        name: 'Renderer Utilization',
        type: 'line',
        data: props.gpu.map((obj) => {
          return obj.renderer_utilization;
        }),
      },
      {
        name: 'Tiler Utilization',
        type: 'line',
        data: props.gpu.map((obj) => {
          return obj.tiler_utilization;
        }),
      },
    ],
  };
  chart.setOption(option);
};
const printFps = () => {
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
      text: 'System FPS',
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
      data: props.fps.map((obj) => {
        return moment(new Date(obj.timestamp * 1000)).format('HH:mm:ss');
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
        data: props.fps.map((obj) => {
          return obj.fps;
        }),
        showSymbol: false,
      },
    ],
  };
  chart.setOption(option);
};
const printDisk = () => {
  let chart = echarts.getInstanceByDom(
    document.getElementById(
      `${props.rid}-${props.cid}-${props.did}-` + `sysDiskChart`
    )
  );
  if (chart == null) {
    chart = echarts.init(
      document.getElementById(
        `${props.rid}-${props.cid}-${props.did}-` + `sysDiskChart`
      )
    );
  }
  chart.resize();
  const option = {
    color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#409EFF'],
    title: {
      text: 'System Disk',
      textStyle: {
        color: '#606266',
      },
      x: 'center',
      y: 'top',
    },
    tooltip: {
      trigger: 'axis',
    },
    grid: { top: '25%', left: '18%' },
    toolbox: {
      feature: {
        saveAsImage: { show: true, title: 'Save' },
      },
    },
    legend: {
      top: '8%',
      data: ['Data Read', 'Data Written', 'Reads in', 'Writes Out'],
    },
    xAxis: {
      data: props.disk.map((obj) => {
        return moment(new Date(obj.timestamp * 1000)).format('HH:mm:ss');
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
    yAxis: [{ name: '数据量(b)', min: 0 }],
    series: [
      {
        name: 'Data Read',
        type: 'line',
        data: props.disk.map((obj) => {
          return obj.data_read;
        }),
        showSymbol: false,
      },
      {
        name: 'Data Written',
        type: 'line',
        data: props.disk.map((obj) => {
          return obj.data_written;
        }),
        showSymbol: false,
      },
      {
        name: 'Reads in',
        type: 'line',
        data: props.disk.map((obj) => {
          return obj.reads_in;
        }),
        showSymbol: false,
      },
      {
        name: 'Writes Out',
        type: 'line',
        data: props.disk.map((obj) => {
          return obj.writes_out;
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
    grid: { top: '25%', left: '18%' },
    toolbox: {
      feature: {
        saveAsImage: { show: true, title: 'Save' },
      },
    },
    legend: {
      top: '8%',
      data: ['Bytes In', 'Bytes Out', 'Packets In', 'Packets Out'],
    },
    xAxis: {
      data: props.network.map((obj) => {
        return moment(new Date(obj.timestamp * 1000)).format('HH:mm:ss');
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
    yAxis: [{ name: '上下行(b)', min: 0 }],
    series: [
      {
        name: 'Bytes In',
        type: 'line',
        data: props.network.map((obj) => {
          return obj.bytes_in;
        }),
        showSymbol: false,
      },
      {
        name: 'Bytes Out',
        type: 'line',
        data: props.network.map((obj) => {
          return obj.bytes_out;
        }),
        showSymbol: false,
      },
      {
        name: 'Packets In',
        type: 'line',
        data: props.network.map((obj) => {
          return obj.packets_in;
        }),
        showSymbol: false,
      },
      {
        name: 'Packets Out',
        type: 'line',
        data: props.network.map((obj) => {
          return obj.packets_out;
        }),
        showSymbol: false,
      },
    ],
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
        return moment(new Date(obj.timestamp * 1000)).format('HH:mm:ss');
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
    yAxis: [{ name: 'CPU使用率(%)', min: 0 }],
    series: [
      {
        type: 'line',
        data: props.procPerf.map((obj) => {
          if (obj.proc_perf && obj.proc_perf.cpuUsage) {
            return obj.proc_perf.cpuUsage;
          }
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
    grid: { top: '30%', left: '13%' },
    toolbox: {
      feature: {
        saveAsImage: { show: true, title: 'Save' },
      },
    },
    legend: {
      top: '8%',
      data: [
        'Mem Anon',
        'Mem Resident Size',
        'Mem Virtual Size',
        'Phys Footprint',
      ],
    },
    xAxis: {
      boundaryGap: false,
      type: 'category',
      data: props.procPerf.map((obj) => {
        return moment(new Date(obj.timestamp * 1000)).format('HH:mm:ss');
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
    yAxis: [{ name: '内存占用(b)', min: 0 }],
    series: [
      {
        name: 'Mem Anon',
        type: 'line',
        data: props.procPerf.map((obj) => {
          if (obj.proc_perf && obj.proc_perf.memAnon) {
            return obj.proc_perf.memAnon;
          }
        }),
        showSymbol: false,
        areaStyle: {},
        boundaryGap: false,
      },
      {
        name: 'Mem Resident Size',
        type: 'line',
        data: props.procPerf.map((obj) => {
          if (obj.proc_perf && obj.proc_perf.memResidentSize) {
            return obj.proc_perf.memResidentSize;
          }
        }),
        showSymbol: false,
        areaStyle: {},
        boundaryGap: false,
      },
      {
        name: 'Mem Virtual Size',
        type: 'line',
        data: props.procPerf.map((obj) => {
          if (obj.proc_perf && obj.proc_perf.memVirtualSize) {
            return obj.proc_perf.memVirtualSize;
          }
        }),
        showSymbol: false,
        areaStyle: {},
        boundaryGap: false,
      },
      {
        name: 'Phys Footprint',
        type: 'line',
        data: props.procPerf.map((obj) => {
          if (obj.proc_perf && obj.proc_perf.physFootprint) {
            return obj.proc_perf.physFootprint;
          }
        }),
        showSymbol: false,
        areaStyle: {},
        boundaryGap: false,
      },
    ],
  };
  chart.setOption(option);
};
defineExpose({
  printCpu,
  printMem,
  printGpu,
  printFps,
  printDisk,
  printNetwork,
  printPerfCpu,
  printPerfMem,
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
              :id="rid + '-' + cid + '-' + did + '-' + 'sysCpuChart'"
              v-loading="cpu.length === 0"
              element-loading-text="暂无数据"
              element-loading-spinner="el-icon-box"
              style="width: 100%; height: 350px"
            ></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card style="margin-top: 10px">
            <div
              :id="rid + '-' + cid + '-' + did + '-' + 'sysMemChart'"
              v-loading="mem.length === 0"
              element-loading-text="暂无数据"
              element-loading-spinner="el-icon-box"
              style="width: 100%; height: 350px"
            ></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card style="margin-top: 10px">
            <div
              :id="rid + '-' + cid + '-' + did + '-' + 'sysGpuChart'"
              v-loading="gpu.length === 0"
              element-loading-text="暂无数据"
              element-loading-spinner="el-icon-box"
              style="width: 100%; height: 350px"
            ></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card style="margin-top: 10px">
            <div
              :id="rid + '-' + cid + '-' + did + '-' + 'sysFpsChart'"
              v-loading="fps.length === 0"
              element-loading-text="暂无数据"
              element-loading-spinner="el-icon-box"
              style="width: 100%; height: 350px"
            ></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card style="margin-top: 10px">
            <div
              :id="rid + '-' + cid + '-' + did + '-' + 'sysDiskChart'"
              v-loading="disk.length === 0"
              element-loading-text="暂无数据"
              element-loading-spinner="el-icon-box"
              style="width: 100%; height: 350px"
            ></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card style="margin-top: 10px">
            <div
              :id="rid + '-' + cid + '-' + did + '-' + 'sysNetworkChart'"
              v-loading="network.length === 0"
              element-loading-text="暂无数据"
              element-loading-spinner="el-icon-box"
              style="width: 100%; height: 350px"
            ></div>
          </el-card>
        </el-col>
      </el-row>
    </el-tab-pane>
    <el-tab-pane label="Process PerfMon">
      <el-card style="margin-top: 10px">
        <div
          :id="rid + '-' + cid + '-' + did + '-' + 'perfCpuChart'"
          v-loading="procPerf.length === 0"
          element-loading-text="暂无数据"
          element-loading-spinner="el-icon-box"
          style="width: 100%; height: 350px"
        ></div>
      </el-card>
      <el-card style="margin-top: 10px">
        <div
          :id="rid + '-' + cid + '-' + did + '-' + 'perfMemChart'"
          v-loading="procPerf.length === 0"
          element-loading-text="暂无数据"
          element-loading-spinner="el-icon-box"
          style="width: 100%; height: 350px"
        ></div>
      </el-card>
    </el-tab-pane>
  </el-tabs>
</template>
