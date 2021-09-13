<script setup>
import {ref, onMounted, onBeforeMount} from "vue";
import {useRouter} from "vue-router";
import Pageable from "./Pageable.vue";
import axios from "../http/axios";
import RenderStatus from "./RenderStatus.vue"
import {ElMessage} from "element-plus";

const img = import.meta.globEager("./../assets/img/*")
const router = useRouter();
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
const androidSystemVersion = ref([5, 6, 7, 8, 9, 10, 11, 12]);
const iOSSystemVersion = ref([9, 10, 11, 12, 13, 14]);
const manufacturer = ref([
  "APPLE",
  "HUAWEI",
  "Xiaomi",
  "OPPO",
  "vivo",
  "samsung",
  "Meizu",
  "Google",
  "OnePlus",
  "360",
  "Yulong",
  "GIONEE"
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
const findAll = (pageNum) => {
  axios
      .get("/controller/devices/list", {
        params: {
          page: pageNum || 1,
          pageSize: pageSize.value,
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
      .then((res) => {
        if (res.data.code === 2000) {
          pageData.value = res.data.data;
        }
      });
};
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
      .get("/controller/agents").then((res) => {
    agentList.value = res.data.data
  })
}
const savePwd = (device) => {
  axios
      .put("/controller/devices/savePwd", {id: device.id, password: device.password}).then((res) => {
    if (res.data.code === 2000) {
      ElMessage.success({
        message: res.data.message,
      });
    }
  })
}
const reboot = (id) => {
  axios
      .get("/transport/exchange/reboot", {params: {id: id}}).then((res) => {
    if (res.data.code === 2000) {
      ElMessage.success({
        message: res.data.message,
      });
    }
  })
}
const getImg = (name) => {
  let result;
  try {
    result = img['./../assets/img/' + name + '.jpg'].default
  } catch {
    result = img['./../assets/img/unName.jpg'].default
  }
  return result;
}
onMounted(() => {
  findAll();
  getAllAgents();
})
</script>

<template>
  <el-popover placement="left-start" width="800px" trigger="click">
    <template #reference>
      <el-button size="small" type="primary" style="float:right">高级筛选器</el-button>
    </template>
    <el-form
        label-position="left"
        class="demo-table-expand"
        label-width="90px"
        style="margin-left: 20px"
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
                  man === 'HUAWEI' || man === 'samsung' || man === 'OnePlus'||man === 'GIONEE'
                "
                style="width: 80px"
                :src="getImg(man)"
            />
            <img
                v-else-if="man === 'Xiaomi' ||man === 'APPLE'"
                style="width: 30px"
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
      <el-form-item label="设备型号">
        <el-input
            style="width: 300px"
            v-model="name"
            type="text"
            size="mini"
            placeholder="输入要筛选的型号或设备序列号"
            maxlength="20"
            show-word-limit
            clearable
            @input="handleInput"
        >
        </el-input>
      </el-form-item>
    </el-form>
  </el-popover>
  <el-page-header
      @back="router.go(-1)"
      content="设备中心"
      style="margin-bottom: 20px"
  >
  </el-page-header>
  <el-card :body-style="{ padding: '10px 20px 10px' }">
    <div style="text-align: center">
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
            :body-style="{ padding: '10px 20px 15px 10px' }"
            class="device-card"
        >
          <template #header>
              <span v-if="device.model">{{
                  device.model.length > 25
                      ? device.model.substring(0, 17) + "..."
                      : device.model
                }}</span>
            <RenderStatus :status="device.status"></RenderStatus>
          </template>
          <el-row>
            <el-col :span="10">
              <el-image
                  style="height: 160px"
                  fit="contain"
                  :src="getImg(device.model)"
                  :preview-src-list="[getImg(device.model)]"
                  hide-on-click-modal
              >
              </el-image>
            </el-col>
            <el-col :span="14">
              <el-form
                  label-position="left"
                  class="device-form"
                  label-width="70px"
                  style="margin: 0 0 15px 10px"
              >
                <el-form-item label="设备名称">
                  <div>{{ device.name }}</div>
                </el-form-item>
                <el-form-item label="制造商">
                  <img
                      v-if="
                  device.manufacturer === 'HUAWEI' || device.manufacturer === 'samsung' || device.manufacturer === 'OnePlus'||device.manufacturer === 'GIONEE'
                "
                      style="width: 80px"
                      :src="getImg(device.manufacturer)"
                  />
                  <img
                      v-else-if="device.manufacturer === 'Xiaomi' ||device.manufacturer === 'APPLE'"
                      style="width: 30px"
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
                <el-form-item label="分辨率">
                  <div>{{ device.size }}</div>
                </el-form-item>
                <el-form-item label="所在位置">
                  <div>{{ findAgentById(device.agentId) }}</div>
                </el-form-item>
              </el-form>
            </el-col>
          </el-row>
          <div style="text-align: center">
            <el-button type="primary" size="mini" :disabled="device.status!=='ONLINE'">马上使用</el-button>
            <el-popover placement="right-end" width="300px" trigger="hover">
              <el-form
                  label-position="left"
                  class="demo-table-expand"
                  label-width="90px"
                  style="margin-left: 10px; word-break: break-all"
                  v-if="device.id"
              >
                <el-form-item label="设备名称">
                  <span>{{ device.name }}</span>
                </el-form-item>
                <el-form-item label="设备型号">
                  <span>{{ device.model }}</span>
                </el-form-item>
                <el-form-item label="设备UDID">
                  <span>{{ device.udId }}</span>
                </el-form-item>
                <el-form-item label="屏幕分辨率">
                  <span>{{ device.size }}</span>
                </el-form-item>
                <el-form-item label="CPU版本">
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
                          @click="savePwd(device)"
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
    <Pageable
        :isPageSet="false"
        :pageData="pageData"
        @changePage="findAll"
    ></Pageable>
  </el-card>
</template>