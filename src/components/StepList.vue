<script setup>
import { onMounted, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';
import axios from '../http/axios';
import StepDraggable from './StepDraggable.vue';
import StepUpdate from './StepUpdate.vue';

const { t: $t } = useI18n();
const steps = ref([]);
const props = defineProps({
  caseId: Number,
  projectId: Number,
  platform: Number,
  isShowRun: Boolean,
  isDriverFinish: Boolean,
  debugLoading: Boolean,
});
const emit = defineEmits(['runStep']);
const dialogVisible = ref(false);
const stepId = ref(0);
const parentId = ref(0);
watch(dialogVisible, (newValue, oldValue) => {
  if (!newValue) {
    stepId.value = 0;
    parentId.value = 0;
  }
});
const editStep = async (id) => {
  stepId.value = id;
  await addStep();
};
const setParent = (id) => {
  parentId.value = id;
};
const addStep = () => {
  dialogVisible.value = true;
};
const flush = () => {
  dialogVisible.value = false;
  getStepsList();
};
const deleteStep = (id) => {
  axios
    .get('/controller/steps/deleteCheck', {
      params: {
        id,
      },
    })
    .then((resp) => {
      if (resp.code === 2000) {
        publicSteps.value = resp.data;
        if (publicSteps.value.length === 0) {
          deleteReal(id);
        } else {
          deleteId.value = id;
          checkDialog.value = true;
        }
      }
    });
};
const resetCaseId = (id) => {
  axios
    .get('/controller/steps/resetCaseId', {
      params: {
        id,
      },
    })
    .then((resp) => {
      if (resp.code === 2000) {
        ElMessage.success({
          message: resp.message,
        });
        checkDialog.value = false;
        getStepsList();
      }
    });
};
const checkDialog = ref(false);
const deleteId = ref(0);
const publicSteps = ref([]);
watch(checkDialog, (newValue, oldValue) => {
  if (!newValue) {
    deleteId.value = 0;
    publicSteps.value = [];
  }
});
const deleteReal = (id) => {
  axios
    .delete('/controller/steps', {
      params: {
        id,
      },
    })
    .then((resp) => {
      if (resp.code === 2000) {
        ElMessage.success({
          message: resp.message,
        });
        checkDialog.value = false;
        getStepsList();
      }
    });
};
const getStepsList = () => {
  axios
    .get('/controller/steps/listAll', {
      params: {
        caseId: props.caseId,
      },
    })
    .then((resp) => {
      steps.value = resp.data;
    });
};
const runStep = () => {
  emit('runStep');
};
const copyStep = (id) => {
  axios
    .get('/controller/steps/copy/steps', {
      params: {
        id,
      },
    })
    .then((resp) => {
      if (resp.code === 2000) {
        ElMessage.success({
          message: resp.message,
        });
        getStepsList();
      }
    });
};
onMounted(() => {
  getStepsList();
});
</script>

<template>
  <el-dialog v-model="checkDialog" :title="$t('pubSteps.pList')" width="600px">
    <el-alert title="Warning" type="warning" show-icon :closable="false">
      <template #default>
        <div>{{ $t('pubSteps.alertOne') }}</div>
        <div>
          {{ $t('pubSteps.alertTwo') }}
        </div>
        <div>
          {{ $t('pubSteps.alertThree') }}
        </div>
      </template>
    </el-alert>
    <el-table :data="publicSteps" border style="margin-top: 20px">
      <el-table-column
        prop="id"
        width="90"
        label="id"
        align="center"
      ></el-table-column>
      <el-table-column
        prop="name"
        :label="$t('pubSteps.name')"
        header-align="center"
      >
      </el-table-column>
    </el-table>
    <div style="text-align: center; margin-top: 20px">
      <el-button size="small" type="primary" @click="resetCaseId(deleteId)">{{
        $t('pubSteps.resetCaseId')
      }}</el-button>
      <el-button size="small" type="danger" @click="deleteReal(deleteId)">{{
        $t('pubSteps.deleteReal')
      }}</el-button>
    </div>
  </el-dialog>
  <el-dialog
    v-model="dialogVisible"
    :title="$t('pubSteps.stepInfo')"
    width="600px"
  >
    <step-update
      v-if="dialogVisible"
      :step-id="stepId"
      :case-id="caseId"
      :project-id="projectId"
      :parent-id="parentId"
      :platform="platform"
      @flush="flush"
    ></step-update>
  </el-dialog>
  <div style="margin-bottom: 10px; text-align: center">
    <el-button-group>
      <el-button
        v-if="isShowRun"
        type="success"
        size="mini"
        :disabled="!isDriverFinish && steps.length > 0"
        @click="runStep"
      >
        {{ $t('steps.run') }}
      </el-button>
      <el-button type="primary" size="mini" @click="addStep">{{
        $t('pubSteps.addStep')
      }}</el-button>
    </el-button-group>
  </div>
  <step-draggable
    :steps="steps"
    @setParent="setParent"
    @addStep="addStep"
    @flush="flush"
    @editStep="editStep"
    @copyStep="copyStep"
    @deleteStep="deleteStep"
  />
</template>
