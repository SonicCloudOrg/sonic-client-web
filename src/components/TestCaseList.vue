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
const pageCurrNum = ref(1);
const name = ref('');
const caseId = ref(0);
const dialogVisible = ref(false);
const tableLoading = ref(false);
const moduleIds = ref([]);
const getTestCaseList = (pageNum, pSize) => {
  tableLoading.value = true;
  pageSize.value = pSize || pageSize.value;
  pageCurrNum.value = pageNum || pageCurrNum.value;
  axios
    .get('/controller/testCases/list', {
      params: {
        projectId: props.projectId,
        moduleIds: moduleIds.value.length > 0 ? moduleIds.value : undefined,
        platform: props.platform,
        name: name.value,
        page: pageCurrNum.value,
        pageSize: pageSize.value,
        idSort: sortingType.value.idSort,
        designerSort: sortingType.value.designerSort,
        editTimeSort: sortingType.value.editTimeSort,
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
        moduleList.value.push({ text: $t('common.null'), value: 0 });
      }
    });
};
let sortingType = ref({});
const sequence = (column) => {
  sortingType.value = {};
  if (column.order === 'ascending') {
    if (column.prop === 'id') {
      sortingType.value.idSort = 'asc';
    }
    if (column.prop === 'designer') {
      sortingType.value.designerSort = 'asc';
    }
    if (column.prop === 'editTime') {
      sortingType.value.editTimeSort = 'asc';
    }
  } else if (column.order === 'descending') {
    if (column.prop === 'id') {
      sortingType.value.idSort = 'desc';
    }
    if (column.prop === 'designer') {
      sortingType.value.designerSort = 'desc';
    }
    if (column.prop === 'editTime') {
      sortingType.value.editTimeSort = 'desc';
    }
  }
  // 判断排序方式
  getTestCaseList();
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
  <el-dialog v-model="dialogVisible" :title="$t('testcase.info')" width="600px">
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
    :default-sort="{ prop: 'editTime', order: 'descending' }"
    @filter-change="filter"
    @row-click="selectCase"
    @sort-change="sequence"
  >
    <el-table-column
      width="100"
      label="id"
      prop="id"
      align="center"
      sortable="custom"
      :sort-orders="['ascending', 'descending']"
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
          :placeholder="$t('testcase.namePlace')"
          @input="getTestCaseList()"
        />
      </template>
    </el-table-column>
    <el-table-column
      min-width="110"
      :label="$t('testcase.model')"
      prop="moduleId"
      column-key="moduleId"
      align="center"
      :filters="moduleList"
    >
      <template #default="scope">
        <el-tag v-if="scope.row.modulesDTO !== null" size="small"
          >{{ scope.row.modulesDTO.name }}
        </el-tag>
        <span v-else>{{ $t('common.null') }}</span>
      </template>
    </el-table-column>
    <el-table-column
      min-width="80"
      :label="$t('testcase.version')"
      prop="version"
      align="center"
    >
      <template #default="scope">
        <el-tag v-if="scope.row.version.length > 0" type="info" size="small"
          >{{ scope.row.version }}
        </el-tag>
        <span v-else>{{ $t('common.null') }}</span>
      </template>
    </el-table-column>
    <el-table-column
      min-width="80"
      :label="$t('testcase.designer')"
      sortable="custom"
      prop="designer"
      align="center"
      :sort-orders="['ascending', 'descending']"
      show-overflow-tooltip
    />
    <el-table-column
      min-width="180"
      :label="$t('testcase.editTime')"
      prop="editTime"
      align="center"
      :sort-orders="['ascending', 'descending']"
      sortable="custom"
    />
    <el-table-column
      v-if="!isReadOnly"
      width="300"
      fixed="right"
      :label="$t('common.operate')"
      align="center"
    >
      <template #default="scope">
        <el-button
          size="mini"
          @click="router.push('StepListView/' + scope.row.id)"
          >{{ $t('steps.detail') }}
        </el-button>
        <el-button size="mini" type="primary" @click="editCase(scope.row.id)"
          >{{ $t('common.edit') }}
        </el-button>
        <el-button size="mini" type="primary" plain @click="copy(scope.row.id)"
          >{{ $t('common.copy') }}
        </el-button>
        <el-popconfirm
          style="margin-left: 10px"
          :confirm-button-text="$t('form.confirm')"
          :cancel-button-text="$t('form.cancel')"
          icon="el-icon-warning"
          icon-color="red"
          :title="$t('testcase.deleteTip')"
          @confirm="deleteCase(scope.row.id)"
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
    @change="getTestCaseList"
  ></pageable>
</template>
