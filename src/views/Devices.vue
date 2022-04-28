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

const {t: $t} = useI18n()
import Pageable from "../components/Pageable.vue";
import axios from "../http/axios";
import RenderStatus from "../components/RenderStatus.vue"
import {ElMessage} from "element-plus";
import useClipboard from "vue-clipboard3";
import RenderDeviceName from "../components/RenderDeviceName.vue";
import ColorImg from '@/components/ColorImg.vue';

const {toClipboard} = useClipboard();
const img = import.meta.globEager("./../assets/img/*")
const router = useRouter();
const timer = ref(null);
const refreshTime = ref(0);
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
const jump = (id, platform) => {
  if (platform === 1) {
    router.push({
      path: "AndroidRemote/" + id
    });
  } else {
    router.push({
      path: "IOSRemote/" + id
    });
  }
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
const findAgentById = (id) => {
  let result = $t('form.unknown')
  for (let i in agentList.value) {
    if (agentList.value[i].id === id) {
      result = agentList.value[i].name
      break
    }
  }
  return result
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
const findByCabinet = (cabinetId) => {
  axios
      .get("/controller/agents/findByCabinet", {params: {cabinetId}}).then((resp) => {
    cabinetAgentList.value = resp.data
  }).catch(() => {
    clearInterval(timer.value);
  });
}
const getAllCabinet = () => {
  cabinetLoading.value = true;
  axios
      .get("/controller/cabinet/list").then((resp) => {
    cabinetList.value = resp.data
    if (cabinetList.value.length > 0) {
      findByCabinet(cabinetList.value[0].id)
    }
    cabinetLoading.value = false
  }).catch(() => {
    clearInterval(timer.value);
  });
}
const saveDetail = (device) => {
  axios
      .put("/controller/devices/saveDetail", {
        id: device.id, password: device.password,
        nickName: device.nickName
      }).then((resp) => {
    if (resp['code'] === 2000) {
      ElMessage.success({
        message: resp['message'],
      });
    }
  })
}
const reboot = (id) => {
  axios
      .get("/transport/exchange/reboot", {params: {id: id}}).then((resp) => {
    if (resp['code'] === 2000) {
      ElMessage.success({
        message: resp['message'],
      });
    }
  })
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
const getPhoneImg = (name, url) => {
  let result;
  if (url === null || url.length === 0) {
    result = img['./../assets/img/default.png'].default
  } else {
    result = url;
  }
  return result;
}
const beforeAvatarUpload = (file) => {
  if (file.name.endsWith(".jpg") || file.name.endsWith(".png")) {
    return true;
  } else {
    ElMessage.error({
      message: $t('dialog.suffixError'),
    });
    return false;
  }
}
const upload = (content) => {
  let formData = new FormData();
  formData.append("file", content.file);
  formData.append("type", 'keepFiles');
  axios
      .post("/folder/upload", formData, {headers: {"Content-type": "multipart/form-data"}})
      .then((resp) => {
        if (resp['code'] === 2000) {
          updateImg(content.data.id, resp.data)
        }
      });
}
const updateImg = (id, imgUrl) => {
  axios
      .put("/controller/devices/updateImg", {id, imgUrl})
      .then((resp) => {
        if (resp['code'] === 2000) {
          ElMessage.success({
            message: resp['message'],
          });
          findAll();
        }
      });
}
const deleteDevice = (id) => {
  axios
      .delete("/controller/devices", {params: {id}})
      .then((resp) => {
        if (resp['code'] === 2000) {
          ElMessage.success({
            message: resp['message'],
          });
          findAll();
        }
      });
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
const refresh = () => {
  refreshTime.value++;
  getFilterOption();
  handleFindAll();
  getAllAgents();
  getAllCabinet();
  findTemper();
  if (refreshTime.value === 2) {
    clearInterval(timer.value);
    timer.value = setInterval(refresh, 20000);
  }
}
const refreshNow = (t) => {
  localStorage.setItem('SonicIsRefresh', t);
  if (t === '1') {
    refreshTime.value = 1
    refresh()
  } else {
    clearInterval(timer.value);
  }
}
onBeforeMount(() => {
  isFlush.value = localStorage.getItem('SonicIsRefresh') ? localStorage.getItem('SonicIsRefresh') : '0'
})
onMounted(() => {
  refresh();
  if (isFlush.value === '1') {
    timer.value = setInterval(refresh, 1500);
  }
})
onUnmounted(() => {
  clearInterval(timer.value);
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
  <el-tabs type="border-card" stretch>
    <el-tab-pane :label="$t('devices.deviceCenter')">
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
            <el-card
                shadow="hover"
                :body-style="{ padding: '15px 20px 15px 10px' }"
                class="device-card"
            >
              <template #header>
                <RenderDeviceName :device="device"></RenderDeviceName>
                <RenderStatus :status="device.status" :user="device.user"></RenderStatus>
              </template>
              <el-row>
                <el-col :span="10">
                  <div style="text-align: center">
                    <el-image
                        style="height: 160px"
                        fit="contain"
                        :src="getPhoneImg(device.model,device['imgUrl'])"
                        :preview-src-list="[getPhoneImg(device.model,device['imgUrl'])]"
                        hide-on-click-modal
                    />
                  </div>
                </el-col>
                <el-col :span="14">
                  <el-form
                      label-position="left"
                      class="device-form"
                      label-width="70px"
                      style="margin: 0 0 15px 10px"
                  >
                    <el-form-item :label="$t('devices.form.model')">
                      <div>{{ device.model }}
                      </div>
                    </el-form-item>
                    <el-form-item :label="$t('devices.form.manufacturer')">
                      <img
                          v-if="device.manufacturer === 'HUAWEI' || device.manufacturer === 'samsung' || device.manufacturer === 'OnePlus'||device.manufacturer === 'GIONEE'|| device.manufacturer === 'motorola'|| device.manufacturer === 'HONOR'"
                          style="width: 80px"
                          :src="getImg(device.manufacturer)"
                      />
                      <img
                          v-else-if="device.manufacturer === 'Xiaomi' ||device.manufacturer === 'LGE'||device.manufacturer === 'HTC'||device.manufacturer === 'deltainno'"
                          style="width: 30px"
                          :src="getImg(device.manufacturer)"
                      />
                      <img
                          v-else-if="device.manufacturer === 'blackshark' ||device.manufacturer === 'APPLE'"
                          style="width: 22px"
                          :src="getImg(device.manufacturer)"
                      />
                      <img
                          v-else
                          style="width: 70px"
                          :src="getImg(device.manufacturer)"
                      />

                    </el-form-item>
                    <el-form-item :label="$t('devices.form.system')">
                      <img
                          v-if="device.platform===1"
                          style="width: 30px"
                          :src="getImg('ANDROID')"
                      />
                      <img
                          v-if="device.platform===2"
                          style="width: 22px"
                          :src="getImg('IOS')"
                      />
                      <span style="margin-left: 6px">{{ device.version }}</span>
                    </el-form-item>
                    <el-form-item :label="$t('devices.form.battery.level')">
                      <div :style="'position: relative; display: flex;align-items: center;color:'+((device['level'] === 0 ||
                              (device.status !== 'ONLINE' && device.status !== 'DEBUGGING' && device.status !== 'TESTING'))?'#606266':
                      device['level']<=30?'#F56C6C':(device['level']<=70?'#E6A23C':'#67C23A'))">
                        <ColorImg
                            style="margin-right:5px;"
                            v-if="(device['level'] !== 0 &&
                              (device.status === 'ONLINE' || device.status === 'DEBUGGING' || device.status === 'TESTING'))"
                            :src="device['level'] <=25?img['./../assets/img/powerLow.png'].default
                            :(device['level'] <=50?img['./../assets/img/powerMid.png'].default
                            :(device['level'] <=75?img['./../assets/img/powerHigh.png'].default
                            :img['./../assets/img/powerFull.png'].default))"
                            :width="20"
                            :height="20"
                            :color="(device['level']===0?'#606266':
                      device['level']<=30?'#F56C6C':(device['level']<=70?'#E6A23C':'#67C23A'))"
                        />
                        {{
                          (device['level'] === 0 ||
                              (device.status !== 'ONLINE' && device.status !== 'DEBUGGING' && device.status !== 'TESTING'))
                              ? $t('form.unknown') : device['level']
                        }}
                      </div>
                    </el-form-item>
                    <el-form-item :label="$t('devices.form.battery.temperature')">
                      <div :style="'position: relative; display: flex;align-items: center;color:'+((device['temperature'] === 0 ||
                              (device.status !== 'ONLINE' && device.status !== 'DEBUGGING' && device.status !== 'TESTING'))?'#606266':
                      device['temperature']<300?'#67C23A':(device['temperature']<350?'#E6A23C':'#F56C6C'))">
                        <ColorImg
                            style="margin-left:-4px;margin-right:3px"
                            v-if="(device['temperature'] !== 0 &&
                              (device.status === 'ONLINE' || device.status === 'DEBUGGING' || device.status === 'TESTING'))"
                            :src="img['./../assets/img/tem.png'].default"
                            :width="20"
                            :height="20"
                            :color="(device['temperature']===0?'#606266':
                      device['temperature']<300?'#67C23A':(device['temperature']<350?'#E6A23C':'#F56C6C'))"
                        />
                        {{
                          (device['temperature'] === 0 ||
                              (device.status !== 'ONLINE' && device.status !== 'DEBUGGING' && device.status !== 'TESTING'))
                              ? $t('form.unknown') : (device['temperature'] / 10).toFixed(1) + " ℃"
                        }}
                      </div>
                    </el-form-item>
                    <el-form-item :label="$t('devices.form.agent')">
                      <div>{{ findAgentById(device.agentId) }}</div>
                    </el-form-item>
                  </el-form>
                </el-col>
              </el-row>
              <div style="text-align: center">
                <el-button type="primary" size="mini" :disabled="device.status!=='ONLINE'"
                           @click="jump(device.id,device.platform)">{{ $t('devices.useRightNow') }}
                </el-button>
                <el-popover placement="top" width="340px" trigger="hover">
                  <el-form
                      label-position="left"
                      class="demo-table-expand"
                      label-width="90px"
                      style="margin-left: 10px; word-break: break-all"
                      v-if="device.id"
                  >
                    <el-form-item :label="$t('devices.detail.image')">
                      <el-upload
                          style="width: 30px"
                          :data="{id:device.id}"
                          action=""
                          :with-credentials="true"
                          :before-upload="beforeAvatarUpload"
                          :http-request="upload"
                          :show-file-list="false"
                      >
                        <el-button
                            type="primary"
                            size="mini">{{ $t('devices.detail.uploadImg') }}
                        </el-button
                        >
                      </el-upload>
                    </el-form-item>
                    <el-form-item :label="$t('devices.detail.nickName')">
                      <el-input
                          show-word-limit
                          v-model="device['nickName']"
                          type="text"
                          size="mini"
                          :placeholder="$t('devices.detail.nickPlaceholder')"
                          maxlength="30"
                          style="position: absolute; top: 7px; bottom: 7px"
                      >
                        <template #append>
                          <el-button
                              size="mini"
                              @click="saveDetail(device)"
                          >{{ $t('form.save') }}
                          </el-button
                          >
                        </template>
                      </el-input>
                    </el-form-item>
                    <el-form-item :label="$t('devices.detail.name')">
                      <span>{{ device.name }}</span>
                    </el-form-item>
                    <el-form-item :label="$t('devices.detail.model')">
                      <span>{{ device.model }}</span>
                    </el-form-item>
                    <el-form-item :label="$t('devices.detail.udId')">
                      <span>{{ device.udId }}</span>
                    </el-form-item>
                    <el-form-item :label="$t('devices.detail.size')">
                      <span>{{ device.size }}</span>
                    </el-form-item>
                    <el-form-item :label="$t('devices.detail.cpu')">
                      <span>{{ device.cpu }}</span>
                    </el-form-item>
                    <el-form-item :label="$t('devices.detail.pwd')">
                      <el-input
                          show-word-limit
                          v-model="device.password"
                          type="text"
                          size="mini"
                          :placeholder="$t('devices.detail.pwdPlaceholder')"
                          maxlength="30"
                          style="position: absolute; top: 7px; bottom: 7px"
                      >
                        <template #append>
                          <el-button
                              size="mini"
                              @click="saveDetail(device)"
                          >{{ $t('form.save') }}
                          </el-button
                          >
                        </template>
                      </el-input>
                    </el-form-item>
                    <el-form-item :label="$t('devices.detail.operation')">
                      <el-popconfirm
                          placement="top"
                          :confirmButtonText="$t('form.confirm')"
                          :cancelButtonText="$t('form.cancel')"
                          @confirm="reboot(device.id)"
                          icon="el-icon-warning"
                          iconColor="red"
                          :title="$t('devices.detail.rebootTips')"
                      >
                        <template #reference>
                          <el-button
                              type="danger"
                              size="mini"
                              :disabled="device.status !== 'ONLINE'
                          &&device.status !== 'DEBUGGING'
                          &&device.status !== 'TESTING'
                           &&device.status !== 'ERROR'"
                          >{{ $t('devices.detail.reboot') }}
                          </el-button
                          >
                        </template>
                      </el-popconfirm>
                      <el-popconfirm
                          placement="top"
                          :confirmButtonText="$t('form.confirm')"
                          :cancelButtonText="$t('form.cancel')"
                          @confirm="deleteDevice(device.id)"
                          icon="el-icon-warning"
                          iconColor="red"
                          :title="$t('devices.detail.deleteTips')"
                      >
                        <template #reference>
                          <el-button
                              type="danger"
                              size="mini"
                              :disabled="device.status === 'ONLINE'
                          &&device.status === 'DEBUGGING'
                          &&device.status === 'TESTING'"
                          >{{ $t('common.delete') }}
                          </el-button
                          >
                        </template>
                      </el-popconfirm>
                    </el-form-item>
                  </el-form>
                  <template #reference>
                    <el-button size="mini">{{ $t('devices.moreDetail') }}</el-button>
                  </template>
                </el-popover>
              </div>
            </el-card>
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
    <el-tab-pane :label="$t('devices.agentCenter')">
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
    <el-tab-pane :label="$t('agent.cabinet.manager')">
      <el-button type="primary" size="mini" @click="openCabinet">{{ $t('agent.cabinet.newCabinet') }}</el-button>
      <el-switch class="refresh" active-value="1"
                 inactive-value="0" @change="refreshNow" style="margin-left: 15px"
                 :active-text=" $t('devices.refresh') "
                 active-color="#13ce66"
                 v-model="isFlush"/>
      <el-carousel v-if="cabinetList.length>0&&!cabinetLoading" trigger="click" height="550px"
                   :autoplay="false" arrow="always" :loop="false">
        <el-carousel-item v-for="item in cabinetList" :key="item">
          <el-row :gutter="40">
            <el-col :span="12">
              {{ cabinetAgentList }}
            </el-col>
            <el-col :span="12">

            </el-col>
          </el-row>
          <h3 class="small">{{ item }}</h3>
          <el-button @click="editCabinet(item)">编辑信息</el-button>
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
            <el-select v-model="cabinet.size">
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
