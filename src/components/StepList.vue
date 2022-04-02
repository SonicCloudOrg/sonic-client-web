<script setup>
import {onMounted, ref, watch} from "vue";
import axios from "../http/axios";
import StepDraggable from './StepDraggable.vue'
import StepUpdate from './StepUpdate.vue'
import {ElMessage} from "element-plus";
const steps = ref([]);
const props = defineProps({
  caseId: Number,
  projectId: Number,
  platform: Number,
  isShowRun: Boolean,
  isDriverFinish: Boolean,
  debugLoading: Boolean
})
const emit = defineEmits(['runStep'])
const dialogVisible = ref(false)
const stepId = ref(0)
const parentId = ref(0)
watch(dialogVisible, (newValue, oldValue) => {
  if (!newValue) {
    stepId.value = 0
    parentId.value = 0
  }
})
const editStep = async (id) => {
  stepId.value = id
  await addStep()
}
const setParent = (id) => {
  parentId.value = id
}
const addStep = () => {
  dialogVisible.value = true
}
const flush = () => {
  dialogVisible.value = false
  getStepsList();
}
const deleteStep = (id) => {
  axios.delete("/controller/steps", {
    params: {
      id
    }
  }).then(resp => {
    if (resp['code'] === 2000) {
      ElMessage.success({
        message: resp['message'],
      });
      getStepsList();
    }
  })
}
const getStepsList = () => {
  axios.get("/controller/steps/listAll", {
    params: {
      caseId: props.caseId,
    }
  }).then(resp => {
    steps.value = resp.data
  })
}
const runStep = () => {
  emit('runStep')
}
onMounted(() => {
  getStepsList();
})
</script>
<template>
  <el-dialog v-model="dialogVisible" title="步骤信息" width="600px">
    <step-update v-if="dialogVisible" :step-id="stepId" :case-id="caseId"
                 :project-id="projectId"
                 :parent-id="parentId"
                 :platform="platform" @flush="flush"></step-update>
  </el-dialog>
  <div style="margin-bottom: 10px;text-align: center">
    <el-button-group>
      <el-button type="success" size="mini" v-if="isShowRun" :disabled="(!isDriverFinish)&&steps.length>0"
                 @click="runStep">
        开始运行
      </el-button>
      <el-button type="primary" size="mini" @click="addStep">新增步骤</el-button>
    </el-button-group>
  </div>
  <step-draggable :steps="steps" @setParent="setParent" @addStep="addStep" @flush="flush" @editStep="editStep"
                 @deleteStep="deleteStep"/>
</template>
