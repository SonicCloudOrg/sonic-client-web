<script setup>
import {useRoute, useRouter} from "vue-router";
import {onMounted, ref} from "vue";
import axios from "../http/axios";
import StepList from '../components/StepList.vue'

const img = import.meta.globEager("./../assets/img/*")
const route = useRoute()
const router = useRouter()
const testCase = ref({})
const getImg = (name) => {
  let result;
  if (name === 'meizu') {
    name = 'Meizu'
  }
  if (name === 'LENOVO') {
    name = 'Lenovo'
  }
  try {
    result = img['./../assets/img/' + name + '.jpg'].default
  } catch {
    result = img['./../assets/img/unName.jpg'].default
  }
  return result;
}
const getCaseInfo = (id) => {
  axios.get("/controller/testCases", {
    params: {
      id
    }
  }).then(resp => {
    if (resp['code'] === 2000) {
      testCase.value = resp.data
    }
  })
}
onMounted(() => {
  getCaseInfo(route.params.caseId)
})
</script>
<template>
  <el-page-header
      @back="router.go(-1)"
      content="步骤详情"
      style="margin-bottom: 20px"
  >
  </el-page-header>
  <el-row :gutter="20">
    <el-col :span="6">
      <el-card>
        <template #header><strong>用例详情</strong></template>
      <el-form
          label-position="left"
          class="demo-table-expand"
          label-width="100px"
          style="margin-left: 10px; word-break: break-all"
          v-if="testCase['id']"
      >
        <el-form-item label="用例Id">
          <span>{{ testCase['id'] }}</span>
        </el-form-item>
        <el-form-item label="用例名称">
          <span>{{ testCase.name }}</span>
        </el-form-item>
        <el-form-item label="所属平台">
          <div style=" display: flex;align-items: center;">
            <el-avatar
                style="margin-right: 10px"
                :size="27"
                :src="getImg(testCase['platform']===1?'ANDROID':'IOS')"
                shape="square"
            ></el-avatar
            >
            {{ testCase['platform'] === 1 ? '安卓' : 'iOS' }}
          </div>
        </el-form-item>
        <el-form-item label="模块">
          <span>{{ testCase['module'] }}</span>
        </el-form-item>
        <el-form-item label="版本名称">
          <span>{{ testCase['version'] }}</span>
        </el-form-item>
        <el-form-item label="设计人">
          <span>{{ testCase['designer'] }}</span>
        </el-form-item>
        <el-form-item label="最后修改日期">
          <span>{{ testCase['editTime'] }}</span>
        </el-form-item>
        <el-form-item label="用例描述">
          <span>{{ testCase['des'] }}</span>
        </el-form-item>
      </el-form>
      </el-card>
    </el-col>
    <el-col :span="18">
      <el-card shadow="hover">
        <step-list v-if="testCase['id']" :is-show-run="false" :platform="testCase['platform']" :is-driver-finish="false"
                   :case-id="testCase['id']"
                   :project-id="route.params.projectId"/>
      </el-card>
    </el-col>
  </el-row>
</template>