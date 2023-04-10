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
import { View, VideoPause, Delete } from '@element-plus/icons';
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';
import IOSPerfChart from './IOSPerfChart.vue';

const iosPerfChart = ref(null);
const { t: $t } = useI18n();
const emit = defineEmits(['startPerfmon', 'stopPerfmon']);
const isStart = ref(false);
const perfBundleId = ref('');
const props = defineProps({
  appList: Array,
});
const startPerfmon = () => {
  emit('startPerfmon', perfBundleId.value);
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
  procPerf.value = [];
};
const setData = (data) => {
  if (data.type === 'sys_cpu') {
    cpu.value.push(data);
    iosPerfChart.value.printCpu();
  }
  if (data.type === 'sys_mem') {
    mem.value.push(data);
    iosPerfChart.value.printMem();
  }
  if (data.type === 'gpu') {
    gpu.value.push(data);
    iosPerfChart.value.printGpu();
  }
  if (data.type === 'fps') {
    fps.value.push(data);
    iosPerfChart.value.printFps();
  }
  if (data.type === 'sys_disk') {
    disk.value.push(data);
    iosPerfChart.value.printDisk();
  }
  if (data.type === 'sys_network') {
    network.value.push(data);
    iosPerfChart.value.printNetwork();
  }
  if (data.type === 'process') {
    procPerf.value.push(data);
    iosPerfChart.value.printPerfCpu();
    iosPerfChart.value.printPerfMem();
  }
};
const cpu = ref([]);
const mem = ref([]);
const gpu = ref([]);
const fps = ref([]);
const disk = ref([]);
const network = ref([]);
const procPerf = ref([]);
defineExpose({ setData });
</script>

<template>
  <div>
    <el-select
      v-model="perfBundleId"
      style="margin-right: 10px; width: 280px"
      filterable
      clearable
      size="mini"
      :placeholder="$t('perf.select')"
    >
      <el-option v-for="a in appList" :value="a.bundleId">
        <div style="display: flex; align-items: center">
          <el-avatar
            style="margin-right: 10px"
            :size="30"
            :src="'data:image/png;base64,' + a.iconBase64"
            shape="square"
          ></el-avatar>
          {{ a.name }}
          <span
            style="
              float: right;
              margin-left: 15px;
              color: #909399;
              font-size: 13px;
              font-style: italic;
            "
            >{{ a.bundleId }}</span
          >
        </div>
      </el-option>
    </el-select>
    <el-button
      type="primary"
      size="mini"
      :loading="isStart"
      @click="startPerfmon"
    >
      <el-icon :size="12" style="vertical-align: middle">
        <View />
      </el-icon>
      {{ $t('perf.start') }}
    </el-button>
    <el-button type="warning" size="mini" @click="stopPerfmon">
      <el-icon :size="12" style="vertical-align: middle">
        <VideoPause />
      </el-icon>
      {{ $t('perf.stop') }}
    </el-button>
    <el-button type="danger" size="mini" @click="clearPerfmon">
      <el-icon :size="12" style="vertical-align: middle">
        <Delete />
      </el-icon>
      {{ $t('perf.clear') }}
    </el-button>
    <i-o-s-perf-chart
      ref="iosPerfChart"
      :cid="0"
      :rid="0"
      :did="0"
      :cpu="cpu"
      :mem="mem"
      :fps="fps"
      :gpu="gpu"
      :disk="disk"
      :network="network"
      :proc-perf="procPerf"
    />
  </div>
</template>
