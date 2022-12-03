<script setup>
import { View, VideoPause, Delete } from '@element-plus/icons';
import moment from 'moment';
import { useI18n } from 'vue-i18n';
import { onMounted, ref } from 'vue';
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
const emit = defineEmits(['startPerfmon', 'stopPerfmon']);
const isStart = ref(false);
const startPerfmon = () => {
  emit('startPerfmon');
  isStart.value = true;
};
const stopPerfmon = () => {
  emit('stopPerfmon');
  isStart.value = false;
};
const clearPerfmon = () => {
  cpu.value = [];
  mem.value = [];
  gpu.value = [];
  fps.value = [];
  disk.value = [];
  network.value = [];
};
const setData = (data) => {
  console.log(data);
  if (data.type === 'sys_cpu') {
    cpu.value.push(data);
    printCpu();
  }
  if (data.type === 'sys_mem') {
    mem.value.push(data);
    printMem();
  }
  if (data.type === 'gpu') {
    gpu.value.push(data);
    printGpu();
  }
  if (data.type === 'fps') {
    fps.value.push(data);
    printFps();
  }
  if (data.type === 'sys_disk') {
    disk.value.push(data);
    printDisk();
  }
  if (data.type === 'sys_network') {
    network.value.push(data);
    printNetwork();
  }
};
const cpu = ref([]);
const mem = ref([]);
const gpu = ref([]);
const fps = ref([]);
const disk = ref([]);
const network = ref([]);
defineExpose({ setData });
const printCpu = () => {
  let chart = echarts.getInstanceByDom(document.getElementById('sysCpuChart'));
  if (chart == null) {
    chart = echarts.init(document.getElementById('sysCpuChart'));
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
      data: cpu.value.map((obj) => {
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
        data: cpu.value.map((obj) => {
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
  let chart = echarts.getInstanceByDom(document.getElementById('sysMemChart'));
  if (chart == null) {
    chart = echarts.init(document.getElementById('sysMemChart'));
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
      data: mem.value.map((obj) => {
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
        data: mem.value.map((obj) => {
          return obj.app_memory;
        }),
        showSymbol: false,
        areaStyle: {},
        boundaryGap: false,
      },
      {
        name: 'Free Memory',
        type: 'line',
        data: mem.value.map((obj) => {
          return obj.free_memory;
        }),
        showSymbol: false,
        areaStyle: {},
        boundaryGap: false,
      },
      {
        name: 'Cached Files',
        type: 'line',
        data: mem.value.map((obj) => {
          return obj.cached_files;
        }),
        showSymbol: false,
        areaStyle: {},
        boundaryGap: false,
      },
      {
        name: 'Compressed',
        type: 'line',
        data: mem.value.map((obj) => {
          return obj.compressed;
        }),
        showSymbol: false,
        areaStyle: {},
        boundaryGap: false,
      },
      {
        name: 'Used Memory',
        type: 'line',
        data: mem.value.map((obj) => {
          return obj.used_memory;
        }),
        showSymbol: false,
        areaStyle: {},
        boundaryGap: false,
      },
      {
        name: 'Wired Memory',
        type: 'line',
        data: mem.value.map((obj) => {
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
  let chart = echarts.getInstanceByDom(document.getElementById('sysGpuChart'));
  if (chart == null) {
    chart = echarts.init(document.getElementById('sysGpuChart'));
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
      data: gpu.value.map((obj) => {
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
        data: gpu.value.map((obj) => {
          return obj.device_utilization;
        }),
      },
      {
        name: 'Renderer Utilization',
        type: 'line',
        data: gpu.value.map((obj) => {
          return obj.renderer_utilization;
        }),
      },
      {
        name: 'Tiler Utilization',
        type: 'line',
        data: gpu.value.map((obj) => {
          return obj.tiler_utilization;
        }),
      },
    ],
  };
  chart.setOption(option);
};
const printFps = () => {
  let chart = echarts.getInstanceByDom(document.getElementById('sysFpsChart'));
  if (chart == null) {
    chart = echarts.init(document.getElementById('sysFpsChart'));
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
      data: fps.value.map((obj) => {
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
        data: fps.value.map((obj) => {
          return obj.fps;
        }),
        showSymbol: false,
      },
    ],
  };
  chart.setOption(option);
};
const printDisk = () => {
  let chart = echarts.getInstanceByDom(document.getElementById('sysDiskChart'));
  if (chart == null) {
    chart = echarts.init(document.getElementById('sysDiskChart'));
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
      data: disk.value.map((obj) => {
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
        data: disk.value.map((obj) => {
          return obj.data_read;
        }),
        showSymbol: false,
      },
      {
        name: 'Data Written',
        type: 'line',
        data: disk.value.map((obj) => {
          return obj.data_written;
        }),
        showSymbol: false,
      },
      {
        name: 'Reads in',
        type: 'line',
        data: disk.value.map((obj) => {
          return obj.reads_in;
        }),
        showSymbol: false,
      },
      {
        name: 'Writes Out',
        type: 'line',
        data: disk.value.map((obj) => {
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
    document.getElementById('sysNetworkChart')
  );
  if (chart == null) {
    chart = echarts.init(document.getElementById('sysNetworkChart'));
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
      data: network.value.map((obj) => {
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
        data: network.value.map((obj) => {
          return obj.bytes_in;
        }),
        showSymbol: false,
      },
      {
        name: 'Bytes Out',
        type: 'line',
        data: network.value.map((obj) => {
          return obj.bytes_out;
        }),
        showSymbol: false,
      },
      {
        name: 'Packets In',
        type: 'line',
        data: network.value.map((obj) => {
          return obj.packets_in;
        }),
        showSymbol: false,
      },
      {
        name: 'Packets Out',
        type: 'line',
        data: network.value.map((obj) => {
          return obj.packets_out;
        }),
        showSymbol: false,
      },
    ],
  };
  chart.setOption(option);
};
</script>

<template>
  <div>
    <el-button
      type="primary"
      size="small"
      :loading="isStart"
      @click="startPerfmon"
    >
      <el-icon :size="12" style="vertical-align: middle">
        <View />
      </el-icon>
      开始监控
    </el-button>
    <el-button type="warning" size="small" @click="stopPerfmon">
      <el-icon :size="12" style="vertical-align: middle">
        <VideoPause />
      </el-icon>
      停止监控
    </el-button>
    <el-button type="danger" size="small" @click="clearPerfmon">
      <el-icon :size="12" style="vertical-align: middle">
        <Delete />
      </el-icon>
      清空数据
    </el-button>
    <el-row :gutter="10">
      <el-col :span="12">
        <el-card style="margin-top: 10px">
          <div
            id="sysCpuChart"
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
            id="sysMemChart"
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
            id="sysGpuChart"
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
            id="sysFpsChart"
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
            id="sysDiskChart"
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
            id="sysNetworkChart"
            v-loading="network.length === 0"
            element-loading-text="暂无数据"
            element-loading-spinner="el-icon-box"
            style="width: 100%; height: 350px"
          ></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
