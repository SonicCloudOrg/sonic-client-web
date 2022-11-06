<script setup>
import { ref, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';

import { useI18n } from 'vue-i18n';
import TestCaseUpdate from './TestCaseUpdate.vue';
import Pageable from './Pageable.vue';
import axios from '../http/axios';

const { t: $t } = useI18n();

const props = defineProps({
  projectId: Number,
  platform: Number,
  isReadOnly: Boolean,
});
const router = useRouter();
const pageData = ref({});
const pageSize = ref(15);
const name = ref('');
const caseId = ref(0);
const dialogVisible = ref(false);
const tableLoading = ref(false);
const moduleIds = ref([]);
const getTestCaseList = (pageNum, pSize) => {
  tableLoading.value = true;
  axios
    .get('/controller/testCases/list', {
      params: {
        projectId: props.projectId,
        moduleIds: moduleIds.value.length > 0 ? moduleIds.value : undefined,
        platform: props.platform,
        name: name.value,
        page: pageNum || 1,
        pageSize: pSize || pageSize.value,
      },
    })
    .then((resp) => {
      pageData.value = resp.data;
      tableLoading.value = false;
    });
};
const deleteCase = (id) => {
  axios
    .delete('/controller/testCases', {
      params: {
        id,
      },
    })
    .then((resp) => {
      if (resp.code === 2000) {
        ElMessage.success({
          message: resp.message,
        });
        getTestCaseList();
      }
    });
};
const copy = (id) => {
  axios
    .get('/controller/testCases/copy', {
      params: {
        id,
      },
    })
    .then((resp) => {
      if (resp.code === 2000) {
        ElMessage.success({
          message: resp.message,
        });
        getTestCaseList();
      }
    });
};
const emit = defineEmits(['selectCase']);
const selectCase = (testCase, c, e) => {
  if (props.isReadOnly) {
    emit('selectCase', testCase);
  }
};
const open = () => {
  dialogVisible.value = true;
};
watch(dialogVisible, (newValue, oldValue) => {
  if (!newValue) {
    caseId.value = 0;
  }
});
watch(
  () => props.projectId,
  () => {
    getTestCaseList();
  }
);
const editCase = async (id) => {
  caseId.value = id;
  await open();
};
const flush = () => {
  dialogVisible.value = false;
  getTestCaseList();
};
const moduleList = ref([]);
const getModuleList = () => {
  axios
    .get('/controller/modules/list', { params: { projectId: props.projectId } })
    .then((resp) => {
      if (resp.code === 2000) {
        resp.data.map((item) => {
          moduleList.value.push({ text: item.name, value: item.id });
        });
        moduleList.value.push({ text: '无', value: 0 });
      }
    });
};
const filter = (e) => {
  moduleIds.value = e.moduleId;
  getTestCaseList();
};
onMounted(() => {
  getTestCaseList();
  getModuleList();
});
defineExpose({ open });
</script>

<template>
  <el-dialog v-model="dialogVisible" title="用例信息" width="600px">
    <test-case-update
      v-if="dialogVisible"
      :project-id="projectId"
      :case-id="caseId"
      :platform="platform"
      @flush="flush"
    />
  </el-dialog>
  <el-table
    v-loading="tableLoading"
    :data="pageData['content']"
    border
    :row-style="isReadOnly ? { cursor: 'pointer' } : {}"
    style="margin-top: 15px"
    @filter-change="filter"
    @row-click="selectCase"
  >
    <el-table-column
      width="80"
      label="用例Id"
      prop="id"
      align="center"
      show-overflow-tooltip
    />
    <el-table-column
      min-width="280"
      prop="name"
      header-align="center"
      show-overflow-tooltip
    >
      <template #header>
        <el-input
          v-model="name"
          size="mini"
          placeholder="输入用例名称搜索"
          @input="getTestCaseList()"
        />
      </template>
    </el-table-column>
    <el-table-column
      min-width="110"
      label="模块名称"
      prop="moduleId"
      column-key="moduleId"
      align="center"
      :filters="moduleList"
    >
      <template #default="scope">
        <el-tag v-if="scope.row.modulesDTO !== null" size="small">{{
          scope.row.modulesDTO.name
        }}</el-tag>
        <span v-else>无</span>
      </template>
    </el-table-column>
    <el-table-column
      min-width="80"
      label="版本名称"
      prop="version"
      align="center"
    >
      <template #default="scope">
        <el-tag v-if="scope.row.version.length > 0" type="info" size="small">{{
          scope.row.version
        }}</el-tag>
        <span v-else>无</span>
      </template>
    </el-table-column>
    <el-table-column
      min-width="80"
      label="设计人"
      prop="designer"
      align="center"
      show-overflow-tooltip
    />
    <el-table-column
      min-width="180"
      label="最后修改日期"
      prop="editTime"
      align="center"
    />
    <el-table-column
      v-if="!isReadOnly"
      width="300"
      fixed="right"
      label="操作"
      align="center"
    >
      <template #default="scope">
        <el-button
          size="mini"
          @click="router.push('StepListView/' + scope.row.id)"
          >步骤详情</el-button
        >
        <el-button size="mini" type="primary" @click="editCase(scope.row.id)"
          >编辑</el-button
        >
        <el-button size="mini" type="primary" plain @click="copy(scope.row.id)"
          >复制</el-button
        >
        <el-popconfirm
          style="margin-left: 10px"
          :confirm-button-text="$t('form.confirm')"
          :cancel-button-text="$t('form.cancel')"
          icon="el-icon-warning"
          icon-color="red"
          title="确定删除该用例吗？用例下的步骤将移出该用例"
          @confirm="deleteCase(scope.row.id)"
        >
          <template #reference>
            <el-button type="danger" size="mini">删除</el-button>
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
    @change="getTestCaseList"
  ></pageable>
</template>
