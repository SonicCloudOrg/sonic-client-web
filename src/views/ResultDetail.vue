<script setup>
import {useRoute, useRouter} from "vue-router";
import {onMounted, ref} from "vue";
import axios from "../http/axios";

const router = useRouter()
const route = useRoute()
const results = ref({})
const testCaseList = ref([])
const activeName = ref("")
const getResultInfo = (id) => {
  axios.get("/controller/results", {params: {id}}).then(async resp => {
    if (resp['code'] === 2000) {
      results.value = resp.data
      getSuiteInfo(results.value['suiteId'], results.value['id'])
    }
  })
}
const getSuiteInfo = (id, resultId) => {
  axios.get("/controller/testSuites", {params: {id}}).then(resp => {
    if (resp['code'] === 2000) {
      testCaseList.value = resp.data.testCases
      getStatus(resultId)
    }
  })
}
const getStatus = (id) => {
  axios.get("/controller/resultDetail/listAll", {
    params: {
      resultId: id,
      caseId: 0,
      deviceId: 0,
      type: "status"
    }
  }).then(resp => {
    if (resp['code'] === 2000) {
      for (let i in resp.data) {
        for (let j in testCaseList.value) {
          if (testCaseList.value[j].id === resp.data[i].caseId) {
            testCaseList.value[j].status = resp.data[i].status;
          }
        }
      }
    }
    console.log(testCaseList.value)
  })
}
onMounted(() => {
  getResultInfo(route.params.resultId)
})
</script>
<template>
  <el-page-header
      @back="router.go(-1)"
      content="报告详情"
      style="margin-bottom: 20px"
  >
  </el-page-header>
  {{ results.id }}
  <el-collapse v-model="activeName" accordion>
    <el-collapse-item v-for="c in testCaseList" :key="c" :name="c.id" style="position: relative">
      <template #title>
        <strong style="color: #606266">{{ c.name }}</strong>
        <el-tag style="position:absolute;right: 30px" size="small">{{ c.status }}</el-tag>
      </template>
    </el-collapse-item>
  </el-collapse>
</template>