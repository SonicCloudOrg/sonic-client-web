<script setup>
import {onMounted, ref, watch} from "vue";
import axios from "../http/axios";
import {VueDraggableNext} from 'vue-draggable-next';
import StepUpdate from './StepUpdate.vue'
import StepShow from './StepShow.vue'
import {Delete, Rank, Edit} from "@element-plus/icons";
import {ElMessage} from "element-plus";

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
watch(dialogVisible, (newValue, oldValue) => {
  if (!newValue) {
    stepId.value = 0
  }
})
const editStep = async (id) => {
  stepId.value = id
  await addStep()
}
const addStep = () => {
  dialogVisible.value = true
}
const flush = () => {
  dialogVisible.value = false
  getStepsList();
}
const resetCaseId = (id) => {
  axios.get("/controller/steps/resetCaseId", {
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
const sortStep = (e) => {
  let startId = null;
  let endId = null;
  let direction = "";
  if (e.moved.newIndex > e.moved.oldIndex) {
    direction = "down";
    endId = steps.value[e.moved.newIndex].sort;
    startId = steps.value[e.moved.newIndex - 1].sort;
  } else {
    direction = "up";
    startId = steps.value[e.moved.newIndex].sort;
    endId = steps.value[e.moved.newIndex + 1].sort;
  }
  axios
      .put("/controller/steps/stepSort", {
        caseId: props.caseId,
        direction,
        startId,
        endId,
      })
      .then((resp) => {
        if (resp['code'] === 2000) {
          ElMessage.success({
            message: resp['message'],
          });
          getStepsList();
        }
      });
}
const steps = ref([]);
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
  <el-timeline v-if="steps.length>0">
    <VueDraggableNext tag="div"
                      v-model="steps"
                      handle=".handle"
                      animation="200"
                      forceFallback="true"
                      fallbackClass="shake"
                      ghostClass="g-host"
                      chosenClass="move"
                      @change="sortStep">
      <el-timeline-item
          v-for="(s, index) in steps"
          :key="index"
          :timestamp="'步骤' + (index + 1)"
          placement="top"
          :type="s['error']===1?'primary':(s['error']===2?'warning':'danger')"
          style="padding-bottom: 0px!important;"
          :hollow="true"
      >
        <step-show :step="s"></step-show>
        <div style="float: right">
          <el-button
              circle
              type="primary"
              size="mini"
              @click="editStep(s.id)"
          >
            <el-icon :size="13" style="vertical-align: middle;">
              <Edit/>
            </el-icon>
          </el-button>
          <el-button
              class="handle"
              circle
              size="mini"
          >
            <el-icon :size="13" style="vertical-align: middle;">
              <Rank/>
            </el-icon>
          </el-button>
          <el-popconfirm
              style="margin-left: 10px"
              confirmButtonText="确认"
              cancelButtonText="取消"
              @confirm="resetCaseId(s.id)"
              icon="el-icon-warning"
              iconColor="red"
              title="确定从用例中移除该步骤吗？"
          >
            <template #reference>
              <el-button
                  circle
                  type="danger"
                  size="mini"
              >
                <el-icon :size="13" style="vertical-align: middle;">
                  <Delete/>
                </el-icon>
              </el-button>
            </template>
          </el-popconfirm>
        </div>
      </el-timeline-item>
    </VueDraggableNext>
  </el-timeline>
  <el-empty description="暂无步骤" v-else></el-empty>
</template>
