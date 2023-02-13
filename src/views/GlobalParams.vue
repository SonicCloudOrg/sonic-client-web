<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';

import { useI18n } from 'vue-i18n';
import axios from '../http/axios';

const { t: $t } = useI18n();

const route = useRoute();
const dialogVisible = ref(false);
const pageData = ref([]);
const updateGlobal = ref(null);
const globalParams = ref({
  id: null,
  projectId: route.params.projectId,
  paramsKey: '',
  paramsValue: '',
});
const editGlobalParams = async (id) => {
  await open();
  await getGlobalInfo(id);
};
const open = () => {
  globalParams.value = {
    id: null,
    projectId: route.params.projectId,
    paramsKey: '',
    paramsValue: '',
  };
  dialogVisible.value = true;
};
const getGlobalParamsList = () => {
  axios
    .get('/controller/globalParams/list', {
      params: {
        projectId: route.params.projectId,
      },
    })
    .then((resp) => {
      pageData.value = resp.data;
    });
};
const getGlobalInfo = (id) => {
  axios
    .get('/controller/globalParams', {
      params: {
        id,
      },
    })
    .then((resp) => {
      globalParams.value = resp.data;
    });
};
const deleteGlobal = (id) => {
  axios
    .delete('/controller/globalParams', {
      params: {
        id,
      },
    })
    .then((resp) => {
      if (resp.code === 2000) {
        ElMessage.success({
          message: resp.message,
        });
        getGlobalParamsList();
      }
    });
};
const summit = () => {
  updateGlobal.value.validate((valid) => {
    if (valid) {
      axios.put('/controller/globalParams', globalParams.value).then((resp) => {
        if (resp.code === 2000) {
          ElMessage.success({
            message: resp.message,
          });
          dialogVisible.value = false;
          getGlobalParamsList();
        }
      });
    }
  });
};
onMounted(() => {
  getGlobalParamsList();
});
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="$t('globalParamsTs.dialogVisible.info')"
    width="600px"
  >
    <el-alert
      style="margin-bottom: 10px"
      :title="$t('globalParamsTs.dialogVisible.specialUse')"
      :description="$t('globalParamsTs.dialogVisible.messageInfo')"
      type="info"
      show-icon
      close-text="Get!"
    />
    <el-form
      ref="updateGlobal"
      :model="globalParams"
      size="small"
      class="demo-table-expand"
      label-width="90px"
      label-position="left"
    >
      <el-form-item
        prop="paramsKey"
        :label="$t('globalParamsTs.dialogVisible.keyName')"
        :rules="{
          required: true,
          message: $t('globalParamsTs.dialogVisible.keyNameMessage'),
          trigger: 'blur',
        }"
      >
        <el-input
          v-model="globalParams.paramsKey"
          :placeholder="$t('globalParamsTs.dialogVisible.inputName')"
        ></el-input>
      </el-form-item>
      <el-form-item
        prop="paramsValue"
        :label="$t('globalParamsTs.dialogVisible.valueName')"
        :rules="{
          required: true,
          message: $t('globalParamsTs.dialogVisible.valueNameMessage'),
          trigger: 'blur',
        }"
      >
        <el-input
          v-model="globalParams.paramsValue"
          :placeholder="$t('globalParamsTs.dialogVisible.inputValue')"
        ></el-input>
      </el-form-item>
    </el-form>
    <div style="text-align: center">
      <el-button size="small" type="primary" @click="summit">{{
        $t('form.confirm')
      }}</el-button>
    </div>
  </el-dialog>
  <el-button size="mini" round type="primary" @click="open">{{
    $t('globalParamsTs.addGlobalParams')
  }}</el-button>
  <el-table :data="pageData" style="width: 100%; margin-top: 20px" border>
    <el-table-column
      label="id"
      width="90"
      align="center"
      prop="id"
    ></el-table-column>
    <el-table-column
      :label="$t('globalParamsTs.paramsList.name')"
      width="240"
      align="center"
      prop="paramsKey"
    ></el-table-column>
    <el-table-column
      :label="$t('globalParamsTs.paramsList.value')"
      header-align="center"
      prop="paramsValue"
    ></el-table-column>
    <el-table-column :label="$t('common.operate')" width="170" align="center">
      <template #default="scope">
        <el-button
          type="primary"
          size="mini"
          @click="editGlobalParams(scope.row.id)"
          >{{ $t('common.edit') }}
        </el-button>
        <el-popconfirm
          style="margin-left: 10px"
          :confirm-button-text="$t('form.confirm')"
          :cancel-button-text="$t('form.cancel')"
          icon="el-icon-warning"
          icon-color="red"
          :title="$t('globalParamsTs.delMessage')"
          @confirm="deleteGlobal(scope.row.id)"
        >
          <template #reference>
            <el-button type="danger" size="mini"
              >{{ $t('common.delete') }}
            </el-button>
          </template>
        </el-popconfirm>
      </template>
    </el-table-column>
  </el-table>
</template>
