<script setup>
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';
import Pageable from '../components/Pageable.vue';
import ScriptUpdate from '../components/ScriptUpdate.vue';
import axios from '../http/axios';

const { t: $t } = useI18n();
const route = useRoute();
const id = ref(0);
const pageData = ref({});
const pageSize = ref(15);
const pageCurrNum = ref(1);
const name = ref('');
const dialogVisible = ref(false);
const open = () => {
  dialogVisible.value = true;
};
watch(dialogVisible, (newValue, oldValue) => {
  if (!newValue) {
    id.value = 0;
  }
});
const editScript = async (i) => {
  id.value = i;
  await open();
};
const flush = () => {
  dialogVisible.value = false;
  getScriptList();
};
const tableLoading = ref(false);
const getScriptList = (pageNum, pSize) => {
  tableLoading.value = true;
  pageSize.value = pSize || pageSize.value;
  pageCurrNum.value = pageNum || pageCurrNum.value;
  axios
    .get('/controller/scripts/list', {
      params: {
        projectId: route.params.projectId,
        name: name.value,
        page: pageCurrNum.value,
        pageSize: pageSize.value,
      },
    })
    .then((resp) => {
      pageData.value = resp.data;
      tableLoading.value = false;
    });
};
const deleteScript = (id) => {
  axios
    .delete('/controller/scripts', {
      params: {
        id,
      },
    })
    .then((resp) => {
      if (resp.code === 2000) {
        ElMessage.success({
          message: resp.message,
        });
        getScriptList();
      }
    });
};
onMounted(() => {
  getScriptList();
});
</script>

<template>
  <el-dialog v-model="dialogVisible" :title="$t('script.info')" width="1200px">
    <script-update
      v-if="dialogVisible"
      :id="id"
      :project-id="route.params.projectId"
      @flush="flush"
    />
  </el-dialog>
  <el-button size="mini" round type="primary" @click="open()">{{
    $t('script.add')
  }}</el-button>

  <el-table style="margin-top: 20px" border :data="pageData.content">
    <el-table-column align="center" width="80" property="id" label="id" />
    <el-table-column header-align="center" property="name">
      <template #header>
        <el-input
          v-model="name"
          size="mini"
          :placeholder="$t('script.typeSearch')"
          @input="getScriptList()"
        />
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      width="100"
      property="scriptLanguage"
      :label="$t('script.lang')"
    />
    <el-table-column align="center" width="170" :label="$t('common.operate')">
      <template #default="scope">
        <el-button
          type="primary"
          size="mini"
          @click="editScript(scope.row.id)"
          >{{ $t('common.edit') }}</el-button
        >
        <el-popconfirm
          style="margin-left: 10px"
          :confirm-button-text="$t('form.confirm')"
          :cancel-button-text="$t('form.cancel')"
          icon="el-icon-warning"
          icon-color="red"
          :title="$t('script.deleteMsg')"
          @confirm="deleteScript(scope.row.id)"
        >
          <template #reference>
            <el-button type="danger" size="mini">{{
              $t('common.delete')
            }}</el-button>
          </template>
        </el-popconfirm>
      </template>
    </el-table-column>
  </el-table>
  <pageable
    :is-page-set="true"
    :total="pageData['totalElements']"
    :current-page="pageData['number'] + 1"
    :page-size="pageData['size']"
    @change="getScriptList"
  ></pageable>
</template>
