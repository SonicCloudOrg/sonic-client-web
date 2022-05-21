<script setup>
/*
 *  Copyright (C) [SonicCloudOrg] Sonic Project
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
import {ref, onMounted, watch, onUnmounted, onBeforeMount} from "vue";
import {useRouter} from "vue-router";
import {useI18n} from 'vue-i18n'
import {Operation} from '@element-plus/icons';
import {useStore} from "vuex";
import DeviceDes from '../components/DeviceDes.vue';

const store = useStore();
const {t: $t} = useI18n()
import Pageable from "../components/Pageable.vue";
import axios from "../http/axios";
import {ElMessage} from "element-plus";
import useClipboard from "vue-clipboard3";
import ColorImg from '@/components/ColorImg.vue';

const {toClipboard} = useClipboard();
const img = import.meta.globEager("./../assets/img/*")
const router = useRouter();
const currentTab = ref("")
const timer = ref(null);
const currentDevice = ref({})
const avgTem = ref(0);
const checkAllAndroid = ref(false);
const isAllAndroid = ref(false);
const checkAlliOS = ref(false);
const isAlliOS = ref(false);
const checkAllMan = ref(false);
const isAllMan = ref(false);
const checkAllCpu = ref(false);
const isAllCpu = ref(false);
const checkAllSize = ref(false);
const isAllSize = ref(false);
const checkAllAgent = ref(false);
const isAllAgent = ref(false);
const checkAllStatus = ref(false);
const isAllStatus = ref(false);
const pageData = ref({});
const pageSize = ref(12);
const currDevicesPage = ref(1)
const checkMan = ref([]);
const name = ref("");
const androidSystem = ref([]);
const iOSSystem = ref([]);
const cpu = ref([]);
const status = ref([]);
const size = ref([]);
const agentIds = ref([]);
const cpus = ref([]);
const sizes = ref([]);
const isFlush = ref('0')
const drawer = ref(false)
const androidSystemVersion = ref([5, 6, 7, 8, 9, 10, 11, 12]);
const iOSSystemVersion = ref([9, 10, 11, 12, 13, 14, 15]);
const manufacturer = ref([
  "APPLE",
  "HUAWEI",
  "Xiaomi",
  "OPPO",
  "vivo",
  "samsung",
  "HONOR",
  "Meizu",
  "Google",
  "OnePlus",
  "360",
  "blackshark",
  "Yulong",
  "BBK",
  "nubia",
  "realme",
  "deltainno",
  "GIONEE",
  "HTC",
  "LGE",
  "Sony",
  "motorola",
  "asus",
  "Lenovo",
]);
const statusList = ref([
  {
    value: "ONLINE",
  },
  {
    value: "DEBUGGING",
  },
  {
    value: "TESTING",
  },
  {
    value: "DISCONNECTED",
  },
  {
    value: "OFFLINE",
  },
  {
    value: "UNAUTHORIZED",
  },
  {
    value: "ERROR",
  },
]);
const agentList = ref([]);
const cabinetList = ref([]);
const dialogCabinet = ref(false)
const updateCabinetForm = ref(null)
watch(dialogCabinet, (newValue, oldValue) => {
  if (!newValue) {
    cabinet.value = {
      id: 0,
      name: "",
      size: 1,
      lowLevel: 40,
      lowGear: 1,
      highLevel: 90,
      highGear: 14,
      highTemp: 45,
      highTempTime: 15,
      robotSecret: '',
      robotToken: '',
      robotType: 1
    }
  }
})
const formatLevel = (value) => {
  return value + " %"
}
const formatHighTemp = (value) => {
  return value + " ℃"
}
const formatToolTipLow = (value) => {
  return value + $t('agent.cabinet.edit.lowFormat')
}
const formatToolTipHigh = (value) => {
  return value + $t('agent.cabinet.edit.highFormat')
}
const robotList = [{name: "钉钉群机器人", value: 1, img: "DingTalk"}
  , {name: "企业微信机器人(即将开放)", value: 2, img: "WeChat", disabled: true},
  {name: "飞书群机器人", value: 3, img: "FeiShu"},
  {name: "友空间机器人(即将开放)", value: 4, img: "You", disabled: true}]
const cabinet = ref({
  id: 0,
  name: "",
  size: 1,
  lowLevel: 40,
  lowGear: 1,
  highLevel: 90,
  highGear: 14,
  highTemp: 45,
  highTempTime: 15,
  robotSecret: '',
  robotToken: '',
  robotType: 1
})
const editCabinet = async (t) => {
  cabinet.value = t
  await openCabinet()
}
const openCabinet = () => {
  dialogCabinet.value = true
}
const dialogAgent = ref(false)
const updateAgentForm = ref(null)
watch(dialogAgent, (newValue, oldValue) => {
  if (!newValue) {
    agent.value = {
      id: 0,
      name: ""
    }
  }
})
const agent = ref({
  id: 0,
  name: ""
})
const editAgent = async (id, name) => {
  agent.value = {id, name}
  await openAgent()
}
const openAgent = () => {
  dialogAgent.value = true
}
const shutdownAgent = (id) => {
  axios
      .get("/transport/exchange/stop", {params: {id: id}}).then((resp) => {
    if (resp['code'] === 2000) {
      ElMessage.success({
        message: resp['message'],
      });
    }
  })
}
const copy = (value) => {
  try {
    toClipboard(value);
    ElMessage.success({
      message: $t('dialog.copy.success'),
    });
  } catch (e) {
    ElMessage.error({
      message: $t('dialog.copy.fail'),
    });
  }
}
const updateAgent = () => {
  updateAgentForm['value'].validate((valid) => {
    if (valid) {
      axios.put("/controller/agents/updateName", agent.value).then(resp => {
        if (resp['code'] === 2000) {
          ElMessage.success({
            message: resp['message'],
          });
          dialogAgent.value = false
          getAllAgents()
        }
      })
    }
  })
}
const updateCabinet = () => {
  updateCabinetForm['value'].validate((valid) => {
    if (valid) {
      axios.put("/controller/cabinet", cabinet.value).then(resp => {
        if (resp['code'] === 2000) {
          ElMessage.success({
            message: resp['message'],
          });
          dialogCabinet.value = false
          getAllCabinet()
        }
      })
    }
  })
}
const handleAndroid = (val) => {
  androidSystem.value = val ? androidSystemVersion.value : [];
  isAllAndroid.value = false;
  findAll();
};
const handleCheckedAndroid = (value) => {
  let checkedCount = value.length;
  checkAllAndroid.value = checkedCount === androidSystemVersion.value.length;
  isAllAndroid.value =
      checkedCount > 0 && checkedCount < androidSystemVersion.value.length;
  findAll();
};
const handleIOS = (val) => {
  iOSSystem.value = val ? iOSSystemVersion.value : [];
  isAlliOS.value = false;
  findAll();
};
const handleCheckedIOS = (value) => {
  let checkedCount = value.length;
  checkAlliOS.value = checkedCount === androidSystemVersion.value.length;
  isAlliOS.value =
      checkedCount > 0 && checkedCount < androidSystemVersion.value.length;
  findAll();
};
const handleMan = (val) => {
  checkMan.value = val ? manufacturer.value : [];
  isAllMan.value = false;
  findAll();
};
const handleCheckedMan = (value) => {
  let checkedCount = value.length;
  checkAllMan.value = checkedCount === manufacturer.value.length;
  isAllMan.value =
      checkedCount > 0 && checkedCount < manufacturer.value.length;
  findAll();
};
const handleCpu = (val) => {
  cpu.value = val ? cpus.value : [];
  isAllCpu.value = false;
  findAll();
};
const handleCheckedCpu = (value) => {
  let checkedCount = value.length;
  checkAllCpu.value = checkedCount === cpus.value.length;
  isAllCpu.value = checkedCount > 0 && checkedCount < cpus.value.length;
  findAll();
};
const handleSize = (val) => {
  size.value = val ? sizes.value : [];
  isAllSize.value = false;
  findAll();
};
const handleCheckedSize = (value) => {
  let checkedCount = value.length;
  checkAllSize.value = checkedCount === sizes.value.length;
  isAllSize.value = checkedCount > 0 && checkedCount < sizes.value.length;
  findAll();
};
const handleAgent = (val) => {
  agentIds.value = val
      ? agentList.value.map((item) => {
        return item.id;
      })
      : [];
  isAllAgent.value = false;
  findAll();
};
const handleCheckedAgent = (value) => {
  let checkedCount = value.length;
  checkAllAgent.value = checkedCount === agentList.value.length;
  isAllAgent.value =
      checkedCount > 0 && checkedCount < agentList.value.length;
  findAll();
};
const handleStatus = (val) => {
  status.value = val
      ? statusList.value.map((item) => {
        return item.value;
      })
      : [];
  isAllStatus.value = false;
  findAll();
};
const handleCheckedStatus = (value) => {
  let checkedCount = value.length;
  checkAllStatus.value = checkedCount === statusList.value.length;
  isAllStatus.value =
      checkedCount > 0 && checkedCount < statusList.value.length;
  findAll();
};
const handleInput = () => {
  findAll();
};
const findAll = (pageNum, pSize) => {
  axios
      .get("/controller/devices/list", {
        params: {
          page: pageNum || 1,
          pageSize: pSize || pageSize.value,
          androidVersion:
              androidSystem.value.length === 0 ? undefined : androidSystem.value,
          iOSVersion:
              iOSSystem.value.length === 0 ? undefined : iOSSystem.value,
          manufacturer:
              checkMan.value.length === 0 ||
              checkMan.value.length === manufacturer.value.length
                  ? undefined
                  : checkMan.value,
          cpu:
              cpu.value.length === 0 || cpu.value.length === cpus.value.length
                  ? undefined
                  : cpu.value,
          size:
              size.value.length === 0 || size.value.length === sizes.value.length
                  ? undefined
                  : size.value,
          agentId:
              agentIds.value.length === 0 ||
              agentIds.value.length === agentList.value.length
                  ? undefined
                  : agentIds.value,
          status:
              status.value.length === 0 ||
              status.value.length === statusList.value.length
                  ? undefined
                  : status.value,
          deviceInfo: name.value.length > 0 ? name.value : undefined,
        },
      })
      .then((resp) => {
        if (resp['code'] === 2000) {
          pageData.value = resp.data;
        }
      }).catch(() => {
    clearInterval(timer.value);
  });
};
// 根据接口返回页数处理
const handleFindAll = (pageNum, pageSize) => {
  if (pageNum) {
    currDevicesPage.value = pageNum
  }
  findAll(currDevicesPage.value, pageSize)
}
const findCabinetById = (id) => {
  let result = $t('common.null')
  for (let i in cabinetList.value) {
    if (cabinetList.value[i].id === id) {
      result = cabinetList.value[i].name
      break
    }
  }
  return result
}
const getAllAgents = () => {
  axios
      .get("/controller/agents/list").then((resp) => {
    agentList.value = resp.data
  }).catch(() => {
    clearInterval(timer.value);
  });
}
const cabinetLoading = ref(false)
const cabinetAgentList = ref([])
const findByCabinet = (cabinet) => {
  axios
      .get("/controller/agents/findByCabinet", {params: {cabinetId: cabinet.id}}).then((resp) => {
    generateStorey(cabinet, resp.data)
  }).catch(() => {
    clearInterval(timer.value);
  });
}
const generateStorey = (c, data) => {
  cabinetAgentList.value = []
  let sdef = {agent: 0, devices: [0, 0, 0, 0, 0]}
  let def = {agent: 0, devices: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}
  if (c.size === 1) {
    cabinetAgentList.value = [sdef, sdef]
  }
  if (c.size === 2) {
    for (let i = 0; i < 4; i++) {
      cabinetAgentList.value.push(def)
    }
  }
  if (c.size === 3) {
    for (let i = 0; i < 8; i++) {
      cabinetAgentList.value.push(def)
    }
  }
  for (let i in data) {
    for (let j in cabinetAgentList.value) {
      if (c.size === 1 && parseInt(j) === 1) {
        break
      }
      if (data[i].agent.storey - 1 === parseInt(j)) {
        let defDevices;
        if (c.size === 1) {
          defDevices = [0, 0, 0, 0, 0]
        } else {
          defDevices = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        }
        for (let k in data[i].devices) {
          for (let h in defDevices) {
            if (c.size === 1 && j == 1 &&
                data[i].devices[k].position - 1 === parseInt(h) + 5) {
              defDevices[h] = data[i].devices[k]
              break
            } else if (data[i].devices[k].position - 1 === parseInt(h)) {
              defDevices[h] = data[i].devices[k]
              break
            }
          }
        }
        data[i].devices = defDevices
        cabinetAgentList.value[j] = data[i]
        break
      }
    }
  }
}
const getAllCabinet = () => {
  cabinetLoading.value = true;
  axios
      .get("/controller/cabinet/list").then((resp) => {
    cabinetList.value = resp.data
    if (cabinetList.value.length > 0) {
      findByCabinet(cabinetList.value[0])
    }
    cabinetLoading.value = false
  }).catch(() => {
    clearInterval(timer.value);
  });
}
const switchCabinet = (n, o) => {
  findByCabinet(cabinetList.value[n])
}
const getImg = (name) => {
  let result;
  if (name === 'meizu') {
    name = 'Meizu'
  }
  try {
    result = img['./../assets/img/' + name + '.jpg'].default
  } catch {
    result = img['./../assets/img/unName.jpg'].default
  }
  return result;
}
const getFilterOption = () => {
  axios
      .get("/controller/devices/getFilterOption")
      .then((resp) => {
        if (resp['code'] === 2000) {
          cpus.value = resp['data'].cpu
          sizes.value = resp['data'].size
        }
      }).catch(() => {
    clearInterval(timer.value);
  });
}
const findTemper = () => {
  axios
      .get("/controller/devices/findTemper")
      .then((resp) => {
        if (resp['code'] === 2000) {
          if (resp['data'] !== null) {
            avgTem.value = resp['data'];
          }
        }
      }).catch(() => {
    clearInterval(timer.value);
  });
}
const switchTabs = (e) => {
  refreshNow('switch')
}
const refresh = () => {
  switch (currentTab.value) {
    case "device":
      handleFindAll();
      findTemper();
      getAllAgents();
      break
    case "agent":
      getAllAgents();
      break
    case "cabinet":
      getAllCabinet();
      break
  }
  clearInterval(laterTimer.value);
}
const refreshNow = (t) => {
  if (t !== 'switch') {
    localStorage.setItem('SonicIsRefresh', t);
  }
  if (t === '1' || t === 'switch') {
    if (t === '1') {
      timer.value = setInterval(refresh, 15000);
    }
    refresh()
  } else {
    clearInterval(timer.value);
  }
}
const isFirst = ref('0')
const setFirst = (t) => {
  localStorage.setItem('IsCabinetMain', t)
}
onBeforeMount(() => {
  isFlush.value = localStorage.getItem('SonicIsRefresh') ? localStorage.getItem('SonicIsRefresh') : '0'
  isFirst.value = localStorage.getItem('IsCabinetMain') ? localStorage.getItem('IsCabinetMain') : '0'
  currentTab.value = isFirst.value === '1' ? 'cabinet' : 'device'
})
const laterTimer = ref(null)
onMounted(() => {
  refresh();
  if (isFlush.value === '1') {
    if (currentTab.value === 'device') {
      laterTimer.value = setInterval(refresh, 1500);
    }
    timer.value = setInterval(refresh, 15000);
  }
})
onUnmounted(() => {
  clearInterval(laterTimer.value);
  clearInterval(timer.value);
})
watch(drawer, (newVal, oldVal) => {
  if (newVal) {
    getFilterOption();
  }
})
</script>

<template>
  <el-drawer
      v-model="drawer"
      :with-header="false"
      size="45%"
      direction="ltr"
  >
    <el-scrollbar>
      <el-form
          label-position="left"
          class="demo-table-expand"
          label-width="90px"
      >
        <el-form-item :label="$t('devices.filter.platform.ANDROID')">
          <el-checkbox
              :label="$t('devices.filter.all')"
              :indeterminate="isAllAndroid"
              v-model="checkAllAndroid"
              @change="handleAndroid"
          ></el-checkbox>
          <el-checkbox-group
              v-model="androidSystem"
              @change="handleCheckedAndroid"
              class="device-radio-p"
          >
            <el-checkbox
                v-for="version in androidSystemVersion"
                :key="version"
                :label="version"
            >
              <img
                  width="30"
                  :src="getImg('ANDROID')"
              />
              {{ version }}
            </el-checkbox
            >
          </el-checkbox-group>
        </el-form-item>
        <el-form-item :label="$t('devices.filter.platform.IOS')">
          <el-checkbox
              :label="$t('devices.filter.all')"
              :indeterminate="isAlliOS"
              v-model="checkAlliOS"
              @change="handleIOS"
          ></el-checkbox>
          <el-checkbox-group class="device-radio-p" v-model="iOSSystem" @change="handleCheckedIOS">
            <el-checkbox
                v-for="version in iOSSystemVersion"
                :key="version"
                :label="version"
            >
              <img
                  width="30"
                  :src="getImg('IOS')"
              />
              {{ version }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item :label="$t('devices.filter.manufacturer')">
          <el-checkbox
              :label="$t('devices.filter.all')"
              :indeterminate="isAllMan"
              v-model="checkAllMan"
              @change="handleMan"
          ></el-checkbox>
          <el-checkbox-group
              v-model="checkMan"
              class="device-radio"
              @change="handleCheckedMan"
          >
            <el-checkbox v-for="man in manufacturer" :key="man" :label="man">
              <img
                  v-if="
                        man === 'HUAWEI' || man === 'samsung' || man === 'OnePlus'||man === 'GIONEE'|| man === 'motorola' || man==='HONOR'
                      "
                  style="width: 80px"
                  :src="getImg(man)"
              />
              <img
                  v-else-if="man === 'Xiaomi' ||man === 'APPLE'|| man==='LGE' || man==='HTC'|| man==='deltainno'"
                  style="width: 30px"
                  :src="getImg(man)"
              />
              <img
                  v-else-if="man==='blackshark'"
                  style="width: 22px"
                  :src="getImg(man)"
              />
              <img
                  v-else
                  style="width: 70px"
                  :src="getImg(man)"
              />
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item :label="$t('devices.filter.cpu')">
          <el-checkbox
              :label="$t('devices.filter.all')"
              :indeterminate="isAllCpu"
              v-model="checkAllCpu"
              @change="handleCpu"
          ></el-checkbox>
          <el-checkbox-group v-model="cpu" @change="handleCheckedCpu">
            <el-checkbox v-for="c in cpus" :key="c" :label="c"></el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item :label="$t('devices.filter.size')">
          <el-checkbox
              :label="$t('devices.filter.all')"
              :indeterminate="isAllSize"
              v-model="checkAllSize"
              @change="handleSize"
          ></el-checkbox>
          <el-checkbox-group v-model="size" @change="handleCheckedSize">
            <el-checkbox v-for="s in sizes" :key="s" :label="s"></el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item :label="$t('devices.filter.agent')">
          <el-checkbox
              :label="$t('devices.filter.all')"
              :indeterminate="isAllAgent"
              v-model="checkAllAgent"
              @change="handleAgent"
          ></el-checkbox>
          <el-checkbox-group v-model="agentIds" @change="handleCheckedAgent">
            <el-checkbox
                v-for="agent in agentList"
                :key="agent"
                :label="agent.id"
            >{{ agent.name }}
            </el-checkbox
            >
          </el-checkbox-group>
        </el-form-item>
        <el-form-item :label="$t('devices.filter.status')">
          <el-checkbox
              :label="$t('devices.filter.all')"
              :indeterminate="isAllStatus"
              v-model="checkAllStatus"
              @change="handleStatus"
          ></el-checkbox>
          <el-checkbox-group v-model="status" @change="handleCheckedStatus">
            <el-checkbox
                v-for="statusDevice in statusList"
                :key="statusDevice"
                :label="statusDevice.value"
            >{{ $t('devices.status.' + statusDevice.value) }}
            </el-checkbox
            >
          </el-checkbox-group>
        </el-form-item>
      </el-form>
    </el-scrollbar>
  </el-drawer>
  <el-tabs type="border-card" stretch v-model="currentTab" @tab-click="switchTabs">
    <el-tab-pane name="device" :label="$t('devices.deviceCenter')">
      <el-card>
        <el-input
            style="width: 440px"
            v-model="name"
            type="text"
            size="small"
            :placeholder="$t('devices.filter.placeholder')"
            maxlength="40"
            clearable
            @input="handleInput"
        >
          <template #append>
            <el-button @click="drawer = true">{{ $t('devices.filter.button') }}</el-button>
          </template>
        </el-input>

        <el-switch class="refresh" active-value="1"
                   inactive-value="0" @change="refreshNow" style="margin-left: 15px"
                   :active-text=" $t('devices.refresh') "
                   active-color="#13ce66"
                   v-model="isFlush"/>

        <strong v-if="avgTem!==0" style="float: right; display: flex;align-items: center;
        font-size: 16px;color: #909399;">{{ $t('devices.avgTem') }}
          <div :style="'position: relative; display: flex;align-items: center;color:'
        +(avgTem<300?'#67C23A':(avgTem<350?'#E6A23C':'#F56C6C'))">
            <ColorImg
                :src="img['./../assets/img/tem.png'].default"
                :width="20"
                :height="20"
                :color="(avgTem<300?'#67C23A':(avgTem<350?'#E6A23C':'#F56C6C'))"
            />
            {{ (avgTem / 10).toFixed(1) + " ℃" }}
          </div>
        </strong>

        <div style="text-align: center;margin-top: 20px">
          <el-divider class="device-card-divider">{{ $t('devices.list') }}</el-divider>
        </div>
        <el-row :gutter="20">
          <el-col
              :xs="12"
              :sm="12"
              :md="12"
              :lg="6"
              :xl="6"
              v-for="device in pageData.content"
              :key="device"
              style="margin-top: 20px"
          >
            <DeviceDes :device="device" :agent-list="agentList" @flush="findAll"/>
          </el-col>
        </el-row>
        <pageable
            :isPageSet="false"
            :total="pageData['totalElements']"
            :current-page="pageData['number']+1"
            :page-size="pageData['size']"
            @change="handleFindAll"
        ></pageable>
      </el-card>
    </el-tab-pane>
    <el-tab-pane name="agent" :label="$t('devices.agentCenter')">
      <el-button type="primary" size="mini" @click="openAgent">{{ $t('agent.newAgent') }}</el-button>
      <el-switch class="refresh" active-value="1"
                 inactive-value="0" @change="refreshNow" style="margin-left: 15px"
                 :active-text=" $t('devices.refresh') "
                 active-color="#13ce66"
                 v-model="isFlush"/>
      <el-table :data="agentList" border style="margin-top: 10px">
        <el-table-column prop="id" label="Agent ID" align="center" width="90"></el-table-column>
        <el-table-column prop="name" label="Agent Name" header-align="center" show-overflow-tooltip></el-table-column>
        <el-table-column prop="cabinetId" :label="$t('agent.cabinet.label')" header-align="center" show-overflow-tooltip
                         width="150">
          <template #default="scope">
            <div style="text-align: center" v-if="scope.row.cabinetId===0">
              <el-tag type="info" size="mini">{{ $t('common.null') }}</el-tag>
            </div>
            <span v-else>{{ findCabinetById(scope.row.cabinetId) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="host" label="Host" align="center" show-overflow-tooltip width="150"></el-table-column>
        <el-table-column prop="port" label="Port" align="center" width="90"></el-table-column>
        <el-table-column prop="systemType" :label="$t('agent.system')" align="center" width="150">
          <template #default="scope">
            <div style="display: flex; align-items: center;justify-content: center">
              {{ scope.row.systemType }}
              <img
                  style="margin-left: 10px"
                  v-if="scope.row.systemType!=='unknown' &&
                                    (scope.row.systemType.indexOf('Mac') !== -1 ||
                                      scope.row.systemType.indexOf('Windows') !== -1 ||
                                      scope.row.systemType.indexOf('Linux') !== -1)"
                  height="20"
                  :src="getImg(scope.row.systemType.indexOf('Mac') !== -1
                                      ? 'Mac': scope.row.systemType.indexOf('Linux') !== -1?'Linux':'Windows')"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="version" :label="$t('agent.version')" align="center" width="150"></el-table-column>
        <el-table-column prop="secretKey" label="Agent Key" align="center" width="150">
          <template #default="scope">
            <el-button size="mini" @click="copy(scope.row.secretKey)">{{ $t('agent.clickToCopy') }}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="status" :label="$t('agent.status.name')" align="center" width="90">
          <template #default="scope">
            <el-tag
                size="small"
                type="success"
                v-if="scope.row.status === 1"
            >{{ $t('agent.status.online') }}
            </el-tag
            >
            <el-tag
                size="small"
                type="info"
                v-if="scope.row.status === 2"
            >{{ $t('agent.status.offline') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('agent.operation')" align="center" width="180">
          <template #default="scope">
            <el-button size="mini" type="primary" @click="editAgent(scope.row.id,scope.row.name)">{{
                $t('common.edit')
              }}
            </el-button>
            <el-button size="mini" type="danger" @click="shutdownAgent(scope.row.id)" :disabled="scope.row.status===2">
              {{ $t('agent.shutdown') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-tab-pane>
    <el-tab-pane name="cabinet" :label="$t('agent.cabinet.manager')">
      <el-button type="primary" size="mini" @click="openCabinet">{{ $t('agent.cabinet.newCabinet') }}</el-button>
      <el-switch class="refresh" active-value="1"
                 inactive-value="0" @change="refreshNow" style="margin-left: 15px"
                 :active-text=" $t('devices.refresh') "
                 active-color="#13ce66"
                 v-model="isFlush"/>
      <el-switch class="refresh" active-value="1"
                 inactive-value="0" @change="setFirst" style="margin-left: 15px"
                 active-text="设为首页"
                 active-color="#13ce66"
                 v-model="isFirst"/>
      <el-carousel style="margin-top: 20px;" v-if="cabinetList.length>0&&!cabinetLoading"
                   trigger="click" height="650px"
                   @change="switchCabinet"
                   :autoplay="false" arrow="always" :loop="false">
        <el-carousel-item v-for="item in cabinetList" :key="item">
          <div style="text-align: center"><h1>{{ item.name }}</h1></div>
          <div style="display: flex;justify-content: center;align-items: center">
            <div style="width: 420px;">
              <el-card :body-style="{padding:(item.size===3?'14px':(item.size===2?'40px 14px':'40px 20px'))
              ,backgroundColor:store.state.cabinetBack}">
                <el-space wrap direction="vertical" fill style="width: 100%" :size="
                item.size===3?8:(item.size===2?28:40)">
                  <el-card v-for="(a,i) in cabinetAgentList" :style="'border: 0;'+(
                    store.state.currentTheme!=='light'?'background-color:#606266':'')"
                           :body-style="{padding:(item.size===3?'5px':(item.size===2?'20px 5px':''))
                           ,backgroundColor:store.state.cabinetItemBack}">
                    <div style="display: flex;justify-content: center;align-items: center">
                      <el-tooltip
                          class="box-item"
                          effect="dark"
                          :content="d==0?'未接入设备':(a.agent!=0?d.udId:'Agent未接入')"
                          placement="top"
                          v-for="d in a.devices"
                      >
                        <ColorImg :style="'margin-right: -6px;'+(d==0?'':'cursor: pointer')"
                                  :src="img['./../assets/img/phoneIn.png'].default"
                                  :width="item.size!==1?40:60"
                                  :height="item.size!==1?40:60"
                                  :color="d==0?(store.state.currentTheme!=='light'?'#909399':'#EBEEF5'):(d.status==='ONLINE'?'#67C23A':
                              (d.status==='OFFLINE'||d.status==='DISCONNECTED'?
                              (store.state.currentTheme!=='light'?'#EBEEF5':'#909399'):(d.status==='DEBUGGING'||d.status==='TESTING'?
                              '#409EFF':(d.status==='ERROR'?'#E6A23C':'#F56C6C'))))"
                                  @click="currentDevice = d"/>
                      </el-tooltip>
                      <el-popover
                          placement="right"
                          :width="300"
                          trigger="hover"
                          :disabled="a.agent===0"
                          v-if="!(item.size===1&&i===1)"
                      >
                        <el-form
                            style="margin-left: 6px"
                            label-position="left"
                            class="demo-table-expand"
                            label-width="100px"
                            v-if="a.agent!==0"
                        >
                          <el-form-item label="Agent ID">
                            <span>#{{ a.agent.id }}</span>
                          </el-form-item>
                          <el-form-item label="Agent Name">
                            <span>{{ a.agent.name }}</span>
                          </el-form-item>
                          <el-form-item label="Host">
                            <span>{{ a.agent.host }}</span>
                          </el-form-item>
                          <el-form-item :label="$t('agent.system')">
                            <div style="display: flex; align-items: center">
                              {{ a.agent.systemType }}
                              <img
                                  style="margin-left: 10px"
                                  v-if="a.agent.systemType!=='unknown' &&
                                    (a.agent.systemType.indexOf('Mac') !== -1 ||
                                      a.agent.systemType.indexOf('Windows') !== -1 ||
                                      a.agent.systemType.indexOf('Linux') !== -1)"
                                  height="20"
                                  :src="getImg(a.agent.systemType.indexOf('Mac') !== -1
                                      ? 'Mac': a.agent.systemType.indexOf('Linux') !== -1?'Linux':'Windows')"
                              />
                            </div>
                          </el-form-item>
                          <el-form-item label="Port">
                            <span>{{ a.agent.port }}</span>
                          </el-form-item>
                          <el-form-item :label="$t('agent.version')">
                            <span>{{ a.agent.version }}</span>
                          </el-form-item>
                          <el-form-item :label="$t('agent.status.name')">
                            <el-tag
                                size="small"
                                type="success"
                                v-if="a.agent.status === 1"
                            >{{ $t('agent.status.online') }}
                            </el-tag
                            >
                            <el-tag
                                size="small"
                                type="info"
                                v-if="a.agent.status === 2"
                            >{{ $t('agent.status.offline') }}
                            </el-tag>
                          </el-form-item>
                          <el-form-item :label="$t('agent.operation')">
                            <el-button size="mini" type="primary" @click="editAgent(a.agent.id,a.agent.name)">
                              {{ $t('common.edit') }}
                            </el-button>
                            <el-button size="mini" type="danger" @click="shutdownAgent(a.agent.id)"
                                       :disabled="a.agent.status===2">{{ $t('agent.shutdown') }}
                            </el-button>
                          </el-form-item>
                        </el-form>
                        <template #reference>
                          <ColorImg :style="a.agent==0?'cursor: not-allowed':'cursor: pointer'"
                                    :src="img['./../assets/img/phyLinux.png'].default"
                                    :width="item.size!==1?42:66" :height="item.size!==1?21:33"
                                    :color="a.agent==0?'#909399':(a.agent.status===1?'#67C23A':'#F56C6C')"/>
                        </template>
                      </el-popover>
                      <div v-else style="margin-left:66px"></div>
                    </div>
                  </el-card>
                </el-space>
              </el-card>
            </div>
            <div style="display: flow">
              <el-card shadow="hover" style="margin-left: 30px;margin-bottom: 14px">
                <el-descriptions title="机柜信息" border :column="2" size="small">
                  <el-descriptions-item label="ID">{{ item.id }}</el-descriptions-item>
                  <el-descriptions-item label="名称">{{ item.name }}</el-descriptions-item>
                  <el-descriptions-item label="规格">
                    {{
                      item.size === 1 ? $t('agent.cabinet.edit.small') : (item.size === 2 ? $t('agent.cabinet.edit.middle') : $t('agent.cabinet.edit.large'))
                    }}
                  </el-descriptions-item>
                  <el-descriptions-item label="Key">
                    <el-button @click="copy(item.secretKey)" size="mini">{{ $t('agent.clickToCopy') }}</el-button>
                  </el-descriptions-item>
                  <template #extra>
                    <el-button type="primary" size="mini" @click="editCabinet(item)">机柜配置</el-button>
                  </template>
                </el-descriptions>
              </el-card>
              <DeviceDes :detail="true" style="width: 350px;height:300px;margin-left: 30px" v-if="currentDevice.id"
                         :device="currentDevice" :agent-list="agentList"
                         @flush="findAll"/>
              <el-card shadow="hover" v-else style="width: 350px;height:300px;margin-left: 30px">
                <el-empty description="请选择设备"></el-empty>
              </el-card>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
      <el-empty v-else></el-empty>
    </el-tab-pane>
  </el-tabs>
  <el-dialog v-model="dialogAgent" :title="$t('dialog.agentInfo')" width="500px">
    <el-form v-if="dialogAgent" ref="updateAgentForm" :model="agent" size="small" class="demo-table-expand"
             label-width="90px"
             label-position="left">
      <el-form-item
          prop="name"
          :label="$t('agent.edit.name')"
          :rules="{
          required: true,
          message: $t('agent.edit.rule'),
          trigger: 'blur',
        }"
      >
        <el-input
            v-model="agent.name"
            :placeholder="$t('agent.edit.namePlaceholder')"
        ></el-input>
      </el-form-item>
    </el-form>
    <div style="text-align: center">
      <el-button size="small" type="primary" @click="updateAgent">{{ $t('form.confirm') }}</el-button>
    </div>
  </el-dialog>
  <el-dialog v-model="dialogCabinet" :title="$t('dialog.cabinetInfo')" width="1100px">
    <el-form v-if="dialogCabinet" ref="updateCabinetForm" :model="cabinet" size="small" class="demo-table-expand"
             label-width="90px"
             label-position="left">
      <el-row :gutter="40">
        <el-col :span="12">
          <el-form-item
              prop="name"
              :label="$t('agent.cabinet.edit.name')"
              :rules="{
          required: true,
          message: $t('agent.cabinet.edit.rule'),
          trigger: 'blur',
        }"
          >
            <el-input
                v-model="cabinet.name"
                :placeholder="$t('agent.cabinet.edit.namePlaceholder')"
            ></el-input>
          </el-form-item>
          <el-form-item
              prop="size"
              :label="$t('agent.cabinet.edit.size')"
          >
            <el-select v-model="cabinet.size" :disabled="cabinet.id!==0">
              <el-option :label="$t('agent.cabinet.edit.small')" :value="1"></el-option>
              <el-option :label="$t('agent.cabinet.edit.middle')" :value="2"></el-option>
              <el-option :label="$t('agent.cabinet.edit.large')" :value="3"></el-option>
            </el-select>
          </el-form-item>
          <el-divider>
            <el-icon>
              <Operation/>
            </el-icon>
          </el-divider>
          <el-form-item
              prop="name"
              :label="$t('agent.cabinet.edit.lowLevel')"
          >
            <el-slider show-input :format-tooltip="formatLevel" v-model="cabinet.lowLevel" :max="100" :min="1"/>
          </el-form-item>
          <el-form-item
              prop="name"
              :label="$t('agent.cabinet.edit.highGear')"
          >
            <el-slider :format-tooltip="formatToolTipHigh" v-model="cabinet.highGear" show-stops :max="14" :min="1"/>
          </el-form-item>
          <el-form-item
              prop="name"
              :label="$t('agent.cabinet.edit.highLevel')"
          >
            <el-slider show-input :format-tooltip="formatLevel" v-model="cabinet.highLevel" :max="100" :min="1"/>
          </el-form-item>
          <el-form-item
              prop="name"
              :label="$t('agent.cabinet.edit.lowGear')"
          >
            <el-slider :format-tooltip="formatToolTipLow" v-model="cabinet.lowGear" show-stops :max="14" :min="1"/>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
              prop="name"
              :label="$t('agent.cabinet.edit.highTemp')"
          >
            <el-slider :format-tooltip="formatHighTemp" v-model="cabinet.highTemp" show-input :max="80" :min="1"/>
          </el-form-item>
          <el-form-item
              prop="name"
              :label="$t('agent.cabinet.edit.highTempTime')"
          >
            <el-input-number v-model="cabinet.highTempTime" show-input :max="120" :min="1"/>
            <span style="margin-left: 10px">min</span>
          </el-form-item>
          <el-form-item :label="$t('robot.robotType')">
            <el-select
                style="width: 100%"
                v-model="cabinet.robotType"
                :placeholder="$t('robot.robotTypePlaceholder')"
            >
              <el-option
                  v-for="item in robotList"
                  :key="item.name"
                  :value="item.value"
                  :label="item.name"
                  :disabled="item['disabled']"
              >
                <div style="display: flex;align-items: center">
                  <el-avatar
                      style="margin-right: 10px"
                      :size="30"
                      :src="getImg(item.img)"
                      shape="square"
                  ></el-avatar
                  >
                  {{ item.name }}
                </div>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('robot.robotToken')" prop="robotToken">
            <el-input
                v-model="cabinet.robotToken"
                :placeholder="$t('robot.robotTokenPlaceholder')"
            ></el-input>
          </el-form-item>
          <el-form-item :label="$t('robot.robotSecret')" prop="robotSecret">
            <el-input
                v-model="cabinet.robotSecret"
                :placeholder="$t('robot.robotSecretPlaceholder')"
                type="password"
            ></el-input>
          </el-form-item>
          <el-alert
              :title="$t('agent.cabinet.tips.title')"
              type="info"
              show-icon
              :closable="false"
          >
            <template #default>
              <span v-html="$t('agent.cabinet.tips.content')"></span>
            </template>
          </el-alert>
        </el-col>
      </el-row>
    </el-form>
    <div style="text-align: center;margin-top: 20px">
      <el-button size="small" type="primary" @click="updateCabinet">{{ $t('form.confirm') }}</el-button>
    </div>
  </el-dialog>
</template>
