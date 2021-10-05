<script setup>
import {useRoute, useRouter} from "vue-router";
import {onMounted, ref} from "vue";
import axios from "../http/axios";
import StepLog from '../components/StepLog.vue'

const router = useRouter()
const route = useRoute()
const results = ref({})
const testCaseList = ref([])
const deviceList = ref([])
const caseId = ref(0)
const deviceId = ref(0)
const stepList = ref([])
const getStepList = (pageNum) => {
  axios.get("/controller/resultDetail/list", {
    params: {
      caseId: caseId.value,
      resultId: route.params.resultId,
      deviceId: deviceId.value,
      type: 'step',
      page: pageNum || 1
    }
  }).then(async resp => {
    if (resp['code'] === 2000) {
      stepList.value = resp.data.content
    }
  })
}
const getDeviceList = (ids) => {
  axios.get("/controller/devices/findByIdIn", {params: {ids}}).then(async resp => {
    if (resp['code'] === 2000) {
      deviceList.value = resp.data
      if(deviceList.value.length>0){
        deviceId.value = deviceList.value[0].id
        getStepList();
      }
    }
  })
}
const getResultInfo = (id) => {
  axios.get("/controller/results", {params: {id}}).then(async resp => {
    if (resp['code'] === 2000) {
      results.value = resp.data
      findCaseStatus(results.value['id'])
    }
  })
}
const findCaseStatus = (id) => {
  axios.get("/controller/results/findCaseStatus", {params: {id}}).then(resp => {
    if (resp['code'] === 2000) {
      testCaseList.value = resp.data
      if (testCaseList.value.length > 0) {
        caseId.value = testCaseList.value[0]['case'].id
        if (testCaseList.value[0]['device'].length > 0) {
          getDeviceList(testCaseList.value[0]['device'].map(obj => {
            return obj.deviceId;
          }))
        }
      }
    }
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
  <el-collapse v-model="caseId" accordion>
    <el-collapse-item v-for="c in testCaseList" :key="c" :name="c['case'].id" style="position: relative">
      <template #title>
        <strong style="color: #606266">{{ c['case'].name }}</strong>
        <div style="position:absolute;right: 30px">
          <el-tag size="small">{{ c.startTime }}</el-tag>
          <el-tag size="small">{{ c.endTime }}</el-tag>
        </div>
      </template>
      <el-tabs v-model="deviceId" type="border-card" tab-position="left">
        <el-tab-pane v-for="d in deviceList" :label="d.model" :name="d.id">
          //PASS WARN FAIL
          <step-log :debug-loading="false" :step-log="stepList"/>
        </el-tab-pane>
      </el-tabs>
    </el-collapse-item>
  </el-collapse>
</template>