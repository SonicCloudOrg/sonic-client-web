<script setup>
import {ref, onMounted, watch, onUnmounted, onBeforeMount} from "vue";
import {useRouter} from "vue-router";
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
    name: "空闲中",
    value: "ONLINE",
  },
  {
    name: "占用中",
    value: "DEBUGGING",
  },
  {
    name: "测试中",
    value: "TESTING",
  },
  {
    name: "已断开",
    value: "DISCONNECTED",
  },
  {
    name: "已离线",
    value: "OFFLINE",
  },
  {
    name: "未授权",
    value: "UNAUTHORIZED",
  },
  {
    name: "异常中",
    value: "ERROR",
  },
]);
const agentList = ref([]);
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
const copy = (value) => {
  try {
    toClipboard(value);
    ElMessage.success({
      message: "复制成功！",
    });
  } catch (e) {
    ElMessage.error({
      message: "复制失败！",
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
  let result = '未知'
  for (let i in agentList.value) {
    if (agentList.value[i].id === id) {
      result = agentList.value[i].name
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
  if (url === null || (url && url.length === 0)) {
    result = "https://gitee.com/sonic-cloud/sonic-agent-images/raw/master/devices/" + name + ".jpg";
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
      message: "文件格式有误！",
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
  findTemper();
  if (refreshTime.value === 2) {
    clearInterval(timer.value);
    timer.value = setInterval(refresh, 10000);
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
        <el-form-item label="安卓系统">
          <el-checkbox
              label="全选"
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
        <el-form-item label="iOS系统">
          <el-checkbox
              label="全选"
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
        <el-form-item label="设备制造商">
          <el-checkbox
              label="全选"
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
        <el-form-item label="CPU处理器">
          <el-checkbox
              label="全选"
              :indeterminate="isAllCpu"
              v-model="checkAllCpu"
              @change="handleCpu"
          ></el-checkbox>
          <el-checkbox-group v-model="cpu" @change="handleCheckedCpu">
            <el-checkbox v-for="c in cpus" :key="c" :label="c"></el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="屏幕分辨率">
          <el-checkbox
              label="全选"
              :indeterminate="isAllSize"
              v-model="checkAllSize"
              @change="handleSize"
          ></el-checkbox>
          <el-checkbox-group v-model="size" @change="handleCheckedSize">
            <el-checkbox v-for="s in sizes" :key="s" :label="s"></el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="所在位置">
          <el-checkbox
              label="全选"
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
        <el-form-item label="设备状态">
          <el-checkbox
              label="全选"
              :indeterminate="isAllStatus"
              v-model="checkAllStatus"
              @change="handleStatus"
          ></el-checkbox>
          <el-checkbox-group v-model="status" @change="handleCheckedStatus">
            <el-checkbox
                v-for="statusDevice in statusList"
                :key="statusDevice"
                :label="statusDevice.value"
            >{{ statusDevice.name }}
            </el-checkbox
            >
          </el-checkbox-group>
        </el-form-item>
      </el-form>
    </el-scrollbar>
  </el-drawer>
  <el-tabs type="border-card" stretch>
    <el-tab-pane label="设备中心">
      <el-card>
        <el-input
            style="width: 400px"
            v-model="name"
            type="text"
            size="small"
            placeholder="输入要筛选的型号、设备名称或设备序列号"
            maxlength="40"
            clearable
            @input="handleInput"
        >
          <template #append>
            <el-button @click="drawer = true">高级筛选</el-button>
          </template>
        </el-input>

        <el-switch class="refresh" active-value="1"
                   inactive-value="0" @change="refreshNow" style="margin-left: 15px" active-text="自动刷新" active-color="#13ce66"
                   v-model="isFlush"/>

        <strong v-if="avgTem!==0" style="float: right; display: flex;align-items: center;
        font-size: 16px;color: #909399;">当前平均电池温度：
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
          <el-divider class="device-card-divider">设备列表</el-divider>
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
                    >
                      <template #error>
                        <el-image
                            style="height: 160px"
                            fit="contain"
                            src="https://gitee.com/sonic-cloud/sonic-agent-images/raw/master/devices/sdk_gphone_x86_arm.jpg"
                            :preview-src-list="['https://gitee.com/sonic-cloud/sonic-agent-images/raw/master/devices/sdk_gphone_x86_arm.jpg']"
                            hide-on-click-modal
                        ></el-image>
                      </template>
                    </el-image>
                  </div>
                </el-col>
                <el-col :span="14">
                  <el-form
                      label-position="left"
                      class="device-form"
                      label-width="70px"
                      style="margin: 0 0 15px 10px"
                  >
                    <el-form-item label="设备型号">
                      <div>{{ device.model }}
                      </div>
                    </el-form-item>
                    <el-form-item label="制造商">
                      <img
                          v-if="device.manufacturer === 'HUAWEI' || device.manufacturer === 'samsung' || device.manufacturer === 'OnePlus'||device.manufacturer === 'GIONEE'|| device.manufacturer === 'motorola'|| device.manufacturer === 'HONOR'"
                          style="width: 80px"
                          :src="getImg(device.manufacturer)"
                      />
                      <img
                          v-else-if="device.manufacturer === 'Xiaomi' ||device.manufacturer === 'APPLE'||device.manufacturer === 'LGE'||device.manufacturer === 'HTC'||device.manufacturer === 'deltainno'"
                          style="width: 30px"
                          :src="getImg(device.manufacturer)"
                      />
                      <img
                          v-else-if="device.manufacturer === 'blackshark'"
                          style="width: 22px"
                          :src="getImg(device.manufacturer)"
                      />
                      <img
                          v-else
                          style="width: 70px"
                          :src="getImg(device.manufacturer)"
                      />

                    </el-form-item>
                    <el-form-item label="设备系统">
                      <img
                          style="width: 30px"
                          :src="getImg(device.platform===1?'ANDROID':'IOS')"
                      />
                    </el-form-item>
                    <el-form-item label="系统版本">
                      <div>{{ device.version }}</div>
                    </el-form-item>
                    <el-form-item label="电池温度">
                      <div :style="'position: relative; display: flex;align-items: center;color:'+((device['temperature'] === 0 ||
                              (device.status !== 'ONLINE' && device.status !== 'DEBUGGING' && device.status !== 'TESTING'))?'#606266':
                      device['temperature']<300?'#67C23A':(device['temperature']<350?'#E6A23C':'#F56C6C'))">
                        <ColorImg
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
                              ? "未知" : (device['temperature'] / 10).toFixed(1) + " ℃"
                        }}
                      </div>
                    </el-form-item>
                    <el-form-item label="所在位置">
                      <div>{{ findAgentById(device.agentId) }}</div>
                    </el-form-item>
                  </el-form>
                </el-col>
              </el-row>
              <div style="text-align: center">
                <el-button type="primary" size="mini" :disabled="device.status!=='ONLINE'"
                           @click="jump(device.id,device.platform)">马上使用
                </el-button>
                <el-popover placement="top" width="300px" trigger="hover">
                  <el-form
                      label-position="left"
                      class="demo-table-expand"
                      label-width="90px"
                      style="margin-left: 10px; word-break: break-all"
                      v-if="device.id"
                  >
                    <el-form-item label="设备图片">
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
                            size="mini">点击上传
                        </el-button
                        >
                      </el-upload>
                    </el-form-item>
                    <el-form-item label="设备备注">
                      <el-input
                          show-word-limit
                          v-model="device['nickName']"
                          type="text"
                          size="mini"
                          placeholder="输入设备备注信息"
                          maxlength="30"
                          style="position: absolute; top: 7px; bottom: 7px"
                      >
                        <template #append>
                          <el-button
                              size="mini"
                              @click="saveDetail(device)"
                          >保存
                          </el-button
                          >
                        </template>
                      </el-input>
                    </el-form-item>
                    <el-form-item label="设备名称">
                      <span>{{ device.name }}</span>
                    </el-form-item>
                    <el-form-item label="设备型号">
                      <span>{{ device.model }}</span>
                    </el-form-item>
                    <el-form-item label="设备序列号">
                      <span>{{ device.udId }}</span>
                    </el-form-item>
                    <el-form-item label="屏幕分辨率">
                      <span>{{ device.size }}</span>
                    </el-form-item>
                    <el-form-item label="CPU类型">
                      <span>{{ device.cpu }}</span>
                    </el-form-item>
                    <el-form-item label="安装密码">
                      <el-input
                          show-word-limit
                          v-model="device.password"
                          type="text"
                          size="mini"
                          placeholder="默认为Sonic123456"
                          maxlength="30"
                          style="position: absolute; top: 7px; bottom: 7px"
                      >
                        <template #append>
                          <el-button
                              size="mini"
                              @click="saveDetail(device)"
                          >保存
                          </el-button
                          >
                        </template>
                      </el-input>
                    </el-form-item>
                    <el-form-item label="快捷操作">
                      <el-popconfirm
                          placement="top"
                          confirmButtonText="确认"
                          cancelButtonText="取消"
                          @confirm="reboot(device.id)"
                          icon="el-icon-warning"
                          iconColor="red"
                          title="确定重启该设备吗？"
                      >
                        <template #reference>
                          <el-button
                              type="danger"
                              size="mini"
                              :disabled="device.status !== 'ONLINE'
                          &&device.status !== 'DEBUGGING'
                          &&device.status !== 'TESTING'
                           &&device.status !== 'ERROR'"
                          >重启
                          </el-button
                          >
                        </template>
                      </el-popconfirm>
                    </el-form-item>
                  </el-form>
                  <template #reference>
                    <el-button size="mini">更多信息</el-button>
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
    <el-tab-pane label="Agent中心">
      <el-button type="primary" size="mini" @click="openAgent">新增Agent</el-button>
      <div style="text-align: center;margin-top: 20px">
        <el-divider class="device-card-divider">Agent列表</el-divider>
      </div>
      <el-row :gutter="20">
        <el-col
            :xs="12"
            :sm="12"
            :md="12"
            :lg="8"
            :xl="8"
            v-for="agent in agentList"
            :key="agent"
            style="margin-top: 20px"
        >
          <el-card
              shadow="hover"
              :body-style="{ padding: '10px 20px 15px 10px'}"
          >
            <template #header>
              <strong>{{ agent.name }}</strong>
              <div style="float: right">
                <el-tag
                    size="small"
                    type="success"
                    v-if="agent.status === 1"
                >在线
                </el-tag
                >
                <el-tag
                    size="small"
                    type="info"
                    v-if="agent.status === 2"
                >离线
                </el-tag
                >
              </div>
            </template>
            <el-form
                style="margin-left: 10px"
                label-position="left"
                class="demo-table-expand"
                label-width="100px"
            >
              <el-form-item label="Agent ID">
                <span>#{{ agent.id }}</span>
              </el-form-item>
              <el-form-item label="Agent所在IP">
                <span>{{ agent.host }}</span>
              </el-form-item>
              <el-form-item label="部署系统">
                <div style="display: flex; align-items: center">
                  {{ agent['systemType'] }}
                  <img
                      style="margin-left: 10px"
                      v-if="
                     agent['systemType']!=='未知' &&
                      (agent['systemType'].indexOf('Mac') !== -1 ||
                        agent['systemType'].indexOf('Windows') !== -1 ||
                        agent['systemType'].indexOf('Linux') !== -1)
                    "
                      height="20"
                      :src="
                      getImg(agent['systemType'].indexOf('Mac') !== -1
                        ? 'Mac'
                        : agent['systemType'].indexOf('Linux') !== -1?'Linux':'Windows')
                    "
                  />
                </div>
              </el-form-item>
              <el-form-item label="开启端口">
                <span>{{ agent.port }}</span>
              </el-form-item>
              <el-form-item label="Agent端版本">
                <span>{{ agent.version }}</span>
              </el-form-item>
              <el-form-item label="AgentKey">
                <div style="white-space: nowrap;cursor: pointer" @click="copy(agent['secretKey'])">{{
                    agent['secretKey']
                  }}
                </div>
              </el-form-item>
              <el-form-item label="Agent操作">
                <el-button size="mini" type="primary" @click="editAgent(agent.id,agent.name)">编辑</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>
      </el-row>
    </el-tab-pane>
  </el-tabs>
  <el-dialog v-model="dialogAgent" title="Agent信息" width="500px">
    <el-form v-if="dialogAgent" ref="updateAgentForm" :model="agent" size="small" class="demo-table-expand"
             label-width="90px"
             label-position="left">
      <el-form-item
          prop="name"
          label="Agent名称"
          :rules="{
          required: true,
          message: 'Agent名称不能为空',
          trigger: 'blur',
        }"
      >
        <el-input
            v-model="agent.name"
            placeholder="请输入Agent名称"
        ></el-input>
      </el-form-item>
    </el-form>
    <div style="text-align: center">
      <el-button size="small" type="primary" @click="updateAgent">确 定</el-button>
    </div>
  </el-dialog>
</template>
