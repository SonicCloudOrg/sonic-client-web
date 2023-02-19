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
import AndroidPerfChart from './AndroidPerfChart.vue';

const androidPerfChart = ref(null);
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
  sysCpu.value = [];
  sysMem.value = [];
  sysNetwork.value = [];
  procCpu.value = [];
  procMem.value = [];
  procFps.value = [];
  procThread.value = [];
};
const setData = (data) => {
  if (data.process) {
    if (data.process.cpuInfo) {
      procCpu.value.push(data.process.cpuInfo);
      androidPerfChart.value.printPerfCpu();
    }
    if (data.process.memInfo) {
      procMem.value.push(data.process.memInfo);
      androidPerfChart.value.printPerfMem();
    }
    if (data.process.fpsInfo) {
      procFps.value.push(data.process.fpsInfo);
      androidPerfChart.value.printProcFps();
    }
    if (data.process.threadInfo) {
      procThread.value.push(data.process.threadInfo);
      androidPerfChart.value.printProcThread();
    }
  }
  if (data.system) {
    if (data.system.cpuInfo) {
      sysCpu.value.push(data.system.cpuInfo);
      androidPerfChart.value.printCpu();
      androidPerfChart.value.printSingleCpu();
    }
    if (data.system.memInfo) {
      sysMem.value.push(data.system.memInfo);
      androidPerfChart.value.printMem();
    }
    if (data.system.networkInfo) {
      sysNetwork.value.push(data.system.networkInfo);
      androidPerfChart.value.printNetwork();
    }
  }
};
const sysCpu = ref([]);
const sysMem = ref([]);
const sysNetwork = ref([]);
const procCpu = ref([]);
const procMem = ref([]);
const procFps = ref([]);
const procThread = ref([]);
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
      <el-option v-for="a in appList" :value="a.packageName">
        <div style="display: flex; align-items: center">
          <el-avatar
            style="margin-right: 10px"
            :size="30"
            :src="'data:image/png;base64,' + a.appIcon"
            shape="square"
          ></el-avatar>
          {{ a.appName }}
          <span
            style="
              float: right;
              margin-left: 15px;
              color: #909399;
              font-size: 13px;
              font-style: italic;
            "
            >{{ a.packageName }}</span
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
    <android-perf-chart
      ref="androidPerfChart"
      :cid="0"
      :rid="0"
      :did="0"
      :sys-cpu="sysCpu"
      :sys-mem="sysMem"
      :sys-network="sysNetwork"
      :proc-cpu="procCpu"
      :proc-mem="procMem"
      :proc-fps="procFps"
      :proc-thread="procThread"
    />
  </div>
</template>
