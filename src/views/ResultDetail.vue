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
const deviceId = ref('')
const stepList = ref([])
let page = 1;
const switchDevice = async (e) => {
  stepList.value = []
  await getStepList();
}
const loadMore = () => {
  page++;
  getStepList()
}
const getStepList = () => {
  axios.get("/controller/resultDetail/list", {
    params: {
      caseId: caseId.value,
      resultId: route.params.resultId,
      deviceId: deviceId.value,
      type: 'step',
      page: page
    }
  }).then(async resp => {
    if (resp['code'] === 2000) {
      stepList.value.push(...resp.data.content)
    }
  })
}
const getDeviceList = (ids) => {
  axios.get("/controller/devices/findByIdIn", {
    params: {
      ids: ids.map(obj => {
        return obj.deviceId;
      })
    }
  }).then(async resp => {
    if (resp['code'] === 2000) {
      deviceList.value = resp.data
      for (let i in ids) {
        for (let j in deviceList.value) {
          if (ids[i].deviceId === deviceList.value[j].id) {
            deviceList.value[j].status = ids[i].status
          }
        }
      }
      if (deviceList.value.length > 0) {
        deviceId.value = deviceList.value[0].id + ''
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
          getDeviceList(testCaseList.value[0]['device'])
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
  <el-card>
    <el-collapse v-model="caseId" accordion>
      <el-collapse-item v-for="c in testCaseList" :key="c" :name="c['case'].id" style="position: relative">
        <template #title>
          <strong style="color: #606266">{{ c['case'].name }}</strong>
          <el-tag style="margin-left: 10px" size="small" :type="c.status===1?'success':
            c.status===2?'warning':
             c.status === 3 ? 'danger' : 'info'">
            <i class="el-icon-loading" style="margin-right: 5px;" v-if="c.status === 4"/>{{
              c.status === 1 ? '通过' :
                  c.status === 2 ? '警告' :
                      c.status === 3 ? '失败' : '运行中'
            }}
          </el-tag>
          <div style="position:absolute;right: 30px">
            <el-tag size="small">{{ c.startTime }}</el-tag>
            <el-tag size="small">{{ c.endTime }}</el-tag>
          </div>
        </template>
        <el-tabs v-model="deviceId" type="border-card" tab-position="left" @tab-click="switchDevice">
          <el-tab-pane v-for="d in deviceList" :name="d.id+''">
            <template #label>
              <div class="flex-center">
                {{ d.model }}
                <el-tag style="margin-left: 10px" size="small" :type="d.status===1?'success':
            d.status===2?'warning':
             d.status === 3 ? 'danger' : 'info'">
                  <i class="el-icon-loading" style="margin-right: 5px;" v-if="d.status === 4"/>{{
                    d.status === 1 ? '通过' :
                        d.status === 2 ? '警告' :
                            d.status === 3 ? '失败' : '运行中'
                  }}
                </el-tag>
              </div>
            </template>
            <step-log :is-read-only="true" :debug-loading="false" :step-log="stepList"/>
          </el-tab-pane>
        </el-tabs>
      </el-collapse-item>
    </el-collapse>
  </el-card>
</template>