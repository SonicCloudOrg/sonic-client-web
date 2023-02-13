<script setup>
import { onMounted, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import axios from '../http/axios';
import TestSuiteUpdate from '../components/TestSuiteUpdate.vue';
import Pageable from '../components/Pageable.vue';

const { t: $t } = useI18n();

const route = useRoute();
const pageData = ref({});
const pageSize = ref(15);
const pageCurrNum = ref(1);
const dialogVisible = ref(false);
const name = ref('');
const suiteId = ref(0);
const loading = ref(false);
const open = () => {
  dialogVisible.value = true;
};
const getTestSuiteList = (pageNum, pSize) => {
  pageSize.value = pSize || pageSize.value;
  pageCurrNum.value = pageNum || pageCurrNum.value;
  axios
    .get('/controller/testSuites/list', {
      params: {
        projectId: route.params.projectId,
        name: name.value,
        page: pageCurrNum.value,
        pageSize: pageSize.value,
      },
    })
    .then((resp) => {
      pageData.value = resp.data;
    });
};
const deleteSuite = (id) => {
  axios
    .delete('/controller/testSuites', {
      params: {
        id,
      },
    })
    .then((resp) => {
      if (resp.code === 2000) {
        ElMessage.success({
          message: resp.message,
        });
        getTestSuiteList();
      }
    });
};
const runSuite = (id) => {
  loading.value = true;
  axios
    .get('/controller/testSuites/runSuite', {
      params: {
        id,
      },
    })
    .then((resp) => {
      loading.value = false;
      if (resp.code === 2000) {
        ElMessage.success({
          message: resp.message + $t('testSuitesTS.testStart'),
        });
      }
    });
};
const editSuite = async (id) => {
  suiteId.value = id;
  await open();
};
watch(dialogVisible, (newValue, oldValue) => {
  if (!newValue) {
    suiteId.value = 0;
  }
});
const flush = () => {
  dialogVisible.value = false;
  getTestSuiteList();
};
onMounted(() => {
  getTestSuiteList();
});
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="$t('testSuitesTS.info')"
    width="950px"
  >
    <test-suite-update
      v-if="dialogVisible"
      :suite-id="suiteId"
      @flush="flush"
    />
  </el-dialog>
  <el-button size="mini" round type="primary" @click="open">{{
    $t('testSuitesTS.add')
  }}</el-button>
  <el-table
    v-loading="loading"
    :data="pageData['content']"
    border
    style="margin-top: 15px"
  >
    <el-table-column
      width="80"
      :label="$t('testSuitesTS.id')"
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
          :placeholder="$t('testSuitesTS.searchMessage')"
          @input="getTestSuiteList()"
        />
      </template>
    </el-table-column>
    <el-table-column
      :label="$t('testSuitesTS.kitPlatform')"
      min-width="110"
      align="center"
    >
      <template #default="scope">
        {{ scope.row.platform === 1 ? $t('publicStepTS.android') : 'iOS' }}
      </template>
    </el-table-column>
    <el-table-column
      :label="$t('testSuitesTS.coverType')"
      min-width="110"
      align="center"
    >
      <template #default="scope">
        <el-tag size="small">{{
          scope.row.cover === 1
            ? $t('testSuitesTS.testCover')
            : $t('testSuitesTS.deviceCover')
        }}</el-tag>
      </template>
    </el-table-column>
    <el-table-column
      :label="$t('testSuitesTS.associated')"
      width="160"
      align="center"
    >
      <template #default="scope">
        <el-popover placement="left-start" width="400px">
          <el-table
            max-height="350"
            :data="scope.row['devices']"
            style="width: 100%; margin-top: 10px"
            border
          >
            <el-table-column
              :label="$t('testSuitesTS.device.id')"
              width="90"
              prop="id"
              align="center"
            >
            </el-table-column>
            <el-table-column
              :label="$t('devices.form.model')"
              prop="model"
              align="center"
            >
            </el-table-column>
            <el-table-column
              :label="$t('devices.detail.udId')"
              prop="udId"
              header-align="center"
              show-overflow-tooltip
            >
            </el-table-column>
          </el-table>
          <template #reference>
            <el-button size="mini"
              >{{ $t('testSuitesTS.viewList') }}
            </el-button>
          </template>
        </el-popover>
      </template>
    </el-table-column>
    <el-table-column
      :label="$t('testSuitesTS.associatedCase')"
      width="170"
      align="center"
    >
      <template #default="scope">
        <el-popover placement="left-start" width="450px">
          <el-table
            max-height="350"
            :data="scope.row['testCases']"
            style="width: 100%; margin-top: 10px"
            border
          >
            <el-table-column
              :label="$t('projectIndexTS.page.caseId')"
              width="90"
              prop="id"
              align="center"
            >
            </el-table-column>
            <el-table-column
              :label="$t('projectIndexTS.page.caseName')"
              prop="name"
              header-align="center"
              show-overflow-tooltip
            >
            </el-table-column>
            <el-table-column
              width="110"
              :label="$t('stepListViewTS.designer')"
              prop="designer"
              align="center"
              show-overflow-tooltip
            >
            </el-table-column>
          </el-table>
          <template #reference>
            <el-button size="mini"
              >{{ $t('testSuitesTS.viewList') }}
            </el-button>
          </template>
        </el-popover>
      </template>
    </el-table-column>
    <el-table-column
      width="250"
      fixed="right"
      :label="$t('common.operate')"
      align="center"
    >
      <template #default="scope">
        <el-button size="mini" type="success" @click="runSuite(scope.row.id)">{{
          $t('testSuitesTS.run')
        }}</el-button>
        <el-button
          size="mini"
          type="primary"
          @click="editSuite(scope.row.id)"
          >{{ $t('common.edit') }}</el-button
        >
        <el-popconfirm
          style="margin-left: 10px"
          :confirm-button-text="$t('form.confirm')"
          :cancel-button-text="$t('form.cancel')"
          icon="el-icon-warning"
          icon-color="red"
          :title="$t('testSuitesTS.delMessage')"
          @confirm="deleteSuite(scope.row.id)"
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
    @change="getTestSuiteList"
  ></pageable>
</template>
