<script setup>
import {onMounted, ref} from "vue";
import axios from "../http/axios";
import {ElMessage} from "element-plus";
import {useStore} from "vuex";
import defaultLogo from '../assets/logo.png'

const img = import.meta.globEager("./../assets/img/*")
const props = defineProps({
  projectId: Number,
  platform: Number,
  caseId: Number
})
const store = useStore()
const testCase = ref({
  id: null,
  name: "",
  platform: props.platform,
  projectId: props.projectId,
  module: "",
  version: "",
  designer: "",
  des: ""
})
const moduleList = ref([])
const versionList = ref([])
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
const platformList = [{name: "安卓", value: 1, img: "ANDROID"}
  , {name: "iOS", value: 2, img: "IOS"}]
const emit = defineEmits(['flush']);
const caseForm = ref(null);
const summit = () => {
  caseForm['value'].validate((valid) => {
    if (valid) {
      axios.put("/controller/testCases", testCase.value).then(resp => {
        if (resp['code'] === 2000) {
          ElMessage.success({
            message: resp['message'],
          });
          emit("flush");
        }
      })
    }
  })
}
const getCaseInfo = (id) => {
  axios.get("/controller/testCases", {params: {id}}).then(resp => {
    if (resp['code'] === 2000) {
      testCase.value = resp.data
    }
  })
}
const getModuleList = (e) => {
  if (e) {
    axios.get("/controller/modules/list", {params: {projectId: props.projectId}}).then(resp => {
      if (resp['code'] === 2000) {
        moduleList.value = resp.data
      }
    })
  }
}
const getVersionList = (e) => {
  if (e) {
    axios.get("/controller/versions/list", {params: {projectId: props.projectId}}).then(resp => {
      if (resp['code'] === 2000) {
        versionList.value = resp.data
      }
    })
  }
}
onMounted(() => {
  if (props.caseId !== 0) {
    getCaseInfo(props.caseId)
  }
})
</script>
<template>
  <el-form
      label-position="left"
      class="demo-table-expand"
      label-width="90px"
      ref="caseForm"
      :model="testCase"
      size="small"
  >
    <el-form-item
        prop="name"
        label="用例名称"
        :rules="{
            required: true,
            message: '请填写用例名称',
            trigger: 'blur',
          }"
    >
      <el-input v-model="testCase.name" size="mini" placeholder="输入用例名称"/>
    </el-form-item>
    <el-form-item
        prop="projectId"
        label="所属项目"
        :rules="{
            required: true,
            message: '请选择项目',
            trigger: 'change',
          }"
    >
      <el-select
          v-model="testCase.projectId"
          placeholder="请选择项目"
      >
        <el-option
            v-for="item in store.state.projectList"
            :key="item.id"
            :value="item.id"
            :label="item['projectName']"
        >
          <div style=" display: flex;align-items: center;">
            <el-avatar
                style="margin-right: 10px"
                :size="32"
                :src="item['projectImg'].length>0?item['projectImg']:defaultLogo"
                shape="square"
            ></el-avatar
            >
            {{ item['projectName'] }}
          </div>
        </el-option>
      </el-select>
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
          v-model="testCase.platform"
          placeholder="请选择平台"
      >
        <el-option
            v-for="item in platformList"
            :key="item.name"
            :value="item.value"
            :label="item.name"
            :disabled="item.disabled"
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
    <el-form-item
        label="模块"
    >
      <el-select
          v-model="testCase.module"
          placeholder="请选择模块"
          @visible-change="getModuleList"
      >
        <el-option
            v-for="item in moduleList"
            :key="item.name"
            :value="item.name"
            :label="item.name"
        >
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item
        label="版本"
    >
      <el-select
          v-model="testCase.version"
          placeholder="请选择版本"
          @visible-change="getVersionList"
      >
        <el-option
            v-for="item in versionList"
            :key="item['versionName']"
            :value="item['versionName']"
            :label="item['versionName']"
        ></el-option>
      </el-select>
    </el-form-item>
    <el-form-item
        label="用例描述"
    >
      <el-input v-model="testCase.des"
                :autosize="{ minRows: 3, maxRows: 7 }"
                :maxlength="240"
                show-word-limit
                type="textarea" size="mini" placeholder="输入用例描述"/>
    </el-form-item>
  </el-form>
  <div style="text-align: center;margin-top: 20px">
    <el-button @click="summit" size="small" type="primary">提交</el-button>
  </div>
</template>