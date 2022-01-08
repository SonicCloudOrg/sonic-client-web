<script setup>
import {onMounted, ref} from "vue";
import axios from "../http/axios";
import {ElMessage} from "element-plus";
import {useRoute} from "vue-router";
import RenderDeviceName from "./RenderDeviceName.vue";
import RenderStatus from "./RenderStatus.vue";

const route = useRoute()
const props = defineProps({
  suiteId: Number
})
const img = import.meta.globEager("./../assets/img/*")
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
const suiteForm = ref(null)
const platformList = [{name: "安卓", value: 1, img: "ANDROID"}
  , {name: "iOS", value: 2, img: "IOS"}]
const testSuite = ref({
  id: null,
  name: "",
  platform: null,
  cover: 1,
  projectId: route.params.projectId,
  devices: [],
  testCases: []
})
const deviceData = ref([])
const deviceDataBack = ref([])
const getDevice = (platform) => {
  axios
      .get("/controller/devices/listAll", {params: {platform}})
      .then((resp) => {
        if (resp['code'] === 2000) {
          deviceData.value = resp.data;
          deviceDataBack.value = resp.data;
        }
      });
}
const testCaseData = ref([])
const getTestCaseList = (platform) => {
  axios
      .get("/controller/testCases/listAll", {params: {platform, projectId: route.params.projectId}})
      .then((resp) => {
        if (resp['code'] === 2000) {
          testCaseData.value = resp.data;
        }
      });
}
const getSource = (platform) => {
  getDevice(platform);
  getTestCaseList(platform)
}
const emit = defineEmits(['flush'])
const summit = () => {
  suiteForm['value'].validate((valid) => {
    if (valid) {
      axios.put("/controller/testSuites", testSuite.value).then(resp => {
        if (resp['code'] === 2000) {
          ElMessage.success({
            message: resp['message'],
          });
          emit('flush');
        }
      })
    }
  })
}
const getSuiteInfo = (id) => {
  axios.get("/controller/testSuites", {params: {id}}).then(resp => {
    if (resp['code'] === 2000) {
      testSuite.value = resp.data
      if (testSuite.value.platform !== null) {
        getSource(testSuite.value.platform)
      }
    }
  })
}
const filterDevice = (name) => {
  if (name) {
    deviceData.value = deviceDataBack.value.filter((item) => {
      if ((item['model'] && item['model'].indexOf(name) !== -1)
          || (item['nickName'] && item['nickName'].indexOf(name) !== -1)
          || (item['chiName'] && item['chiName'].indexOf(name) !== -1)
          || (item['udId'] && item['udId'].indexOf(name) !== -1)) {
        return true
      }
    })
  } else {
    deviceData.value = deviceDataBack.value
  }
}
onMounted(() => {
  if (props.suiteId !== 0) {
    getSuiteInfo(props.suiteId)
  }
})
</script>
<template>
  <el-form
      label-position="left"
      class="demo-table-expand"
      label-width="90px"
      ref="suiteForm"
      :model="testSuite"
      size="small"
  >
    <el-form-item
        prop="name"
        label="套件名称"
        :rules="{
            required: true,
            message: '请填写套件名称',
            trigger: 'blur',
          }"
    >
      <el-input v-model="testSuite.name" size="mini" placeholder="输入套件名称"/>
    </el-form-item>
    <el-form-item
        prop="platform"
        label="平台"
        :rules="{
            required: true,
            message: '请选择平台',
            trigger: 'change',
          }"
    >
      <el-select
          style="width: 100%"
          v-model="testSuite.platform"
          placeholder="请选择平台"
          @change="getSource"
      >
        <el-option
            v-for="item in platformList"
            :key="item.name"
            :value="item.value"
            :label="item.name"
            :disabled="item['disabled']"
        >
          <div style="display: flex;align-items: center;justify-content: center">
            <el-avatar
                style="margin-right: 10px"
                :size="32"
                :src="getImg(item.img)"
                shape="square"
            ></el-avatar
            >
            {{ item.name }}
          </div>
        </el-option>
      </el-select>
    </el-form-item>
    <el-alert
        title="覆盖类型"
        type="info"
        description="用例覆盖即为每个用例只分配一个设备，设备覆盖即为每个设备都会执行所有用例"
        show-icon
        style="margin-bottom: 10px"
        close-text="Get!"
    >
    </el-alert>
    <el-form-item
        label="覆盖类型"
    >
      <el-select
          style="width: 100%"
          v-model="testSuite.cover"
          placeholder="请选择覆盖类型"
      >
        <el-option :value="1" label="用例覆盖"></el-option>
        <el-option :value="2" label="设备覆盖"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item prop="device" label="关联设备">
      <el-select
          :disabled="testSuite.platform===null"
          value-key="id"
          clearable
          filterable
          :filter-method="filterDevice"
          style="width: 100%"
          v-model="testSuite.devices"
          multiple placeholder="请选择测试设备，可输入型号、备注、中文名称、序列号筛选">
        <el-option
            v-for="item in deviceData"
            :key="item.id"
            :label="item.model"
            :value="item"
        >
          <el-image
              style="height: 80%;float: left"
              fit="contain"
              :src="getPhoneImg(item.model,item['imgUrl'])"
          >
            <template #error>
              <el-image
                  style="height: 100%;float: left"
                  fit="contain"
                  src="https://gitee.com/sonic-cloud/sonic-agent-images/raw/master/devices/sdk_gphone_x86_arm.jpg"
              ></el-image>
            </template>
          </el-image>
          <span style="float: left;margin-left: 10px"><RenderDeviceName :device="item"/></span>
          <span style="display: flex;float: right;
    align-items: center;">
          <span style="
            margin-left: 15px;
          color: #909399;
          font-size: 13px;
           font-style: italic;
        "
          >{{ item['udId'] }}</span
          >
            <RenderStatus style="margin-left: 15px;margin-right: -10px" :status="item['status']" :user="item['user']"/>
            </span>
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item prop="testCases" label="关联用例">
      <el-select
          :disabled="testSuite.platform===null"
          value-key="id"
          clearable
          filterable
          style="width: 100%"
          v-model="testSuite.testCases"
          multiple placeholder="请选择测试用例，可输入用例名称筛选">
        <el-option
            v-for="item in testCaseData"
            :key="item.id"
            :label="item.name"
            :value="item"
        >
          <span style="float: left;">{{ item.name }}</span>
          <span style="
            margin-left: 15px;
          float: right;
          color: #909399;
          font-size: 13px;
           font-style: italic;
        "
          >{{ item['editTime'] }}</span
          >
        </el-option>
      </el-select>
    </el-form-item>
  </el-form>

  <div style="text-align: center;margin-top: 20px">
    <el-button @click="summit" size="small" type="primary">提交</el-button>
  </div>
</template>