<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';
import axios from '../http/axios';
import Pageable from '../components/Pageable.vue';

const { t: $t } = useI18n();

const route = useRoute();
const router = useRouter();
const pageData = ref({});
const pageSize = ref(15);
const pageCurrNum = ref(1);
const getResultList = (pageNum, pSize) => {
  pageSize.value = pSize || pageSize.value;
  pageCurrNum.value = pageNum || pageCurrNum.value;
  axios
    .get('/controller/results/list', {
      params: {
        projectId: route.params.projectId,
        page: pageCurrNum.value,
        pageSize: pageSize.value,
      },
    })
    .then((resp) => {
      pageData.value = resp.data;
    });
};
const delResult = (id) => {
  axios
    .delete('/controller/results', {
      params: {
        id,
      },
    })
    .then((resp) => {
      if (resp.code === 2000) {
        ElMessage.success({
          message: resp.message,
        });
        getResultList();
      }
    });
};
const forceStopSuite = (id) => {
  axios
    .get('/controller/testSuites/forceStopSuite', {
      params: {
        resultId: id,
      },
    })
    .then((resp) => {
      if (resp.code === 2000) {
        ElMessage.success({
          message: resp.message,
        });
        getResultList();
      }
    });
};
onMounted(() => {
  getResultList();
});
</script>

<template>
  <el-table :data="pageData['content']" border>
    <el-table-column
      width="80"
      :label="$t('resultDetailTS.page.resultId')"
      prop="id"
      align="center"
      show-overflow-tooltip
    />
    <el-table-column
      :label="$t('ResultsTS.name')"
      min-width="280"
      prop="suiteName"
      header-align="center"
      show-overflow-tooltip
    >
    </el-table-column>
    <el-table-column
      :label="$t('resultDetailTS.page.executeUser')"
      width="120"
      align="center"
    >
      <template #default="scope">
        <el-tag v-if="scope.row.strike === 'SYSTEM'" size="small"
          >{{ $t('routes.timedTask') }}
        </el-tag>
        <span v-else>{{ scope.row.strike }}</span>
      </template>
    </el-table-column>
    <el-table-column
      :label="$t('resultDetailTS.page.runStatus')"
      width="120"
      align="center"
    >
      <template #default="scope">
        <el-tag v-if="scope.row.status === 1" type="success" size="small"
          >{{ $t('resultDetailTS.page.testPass') }}
        </el-tag>
        <el-tag v-if="scope.row.status === 0" type="info" size="small"
          ><i class="el-icon-loading"></i> {{ $t('resultDetailTS.runIng') }}
        </el-tag>
        <el-tag v-if="scope.row.status === 3" type="danger" size="small"
          >{{ $t('resultDetailTS.page.testFail') }}
        </el-tag>
        <el-tag v-if="scope.row.status === 2" type="warning" size="small"
          >{{ $t('resultDetailTS.page.testAlert') }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column
      :label="$t('packagesTS.creatTime')"
      width="200"
      prop="createTime"
      align="center"
    >
    </el-table-column>
    <el-table-column
      fixed="right"
      :label="$t('ResultsTS.testReport')"
      width="160"
      align="center"
    >
      <template #default="scope">
        <div style="text-align: center">
          <el-button
            size="mini"
            icon="el-icon-tickets"
            @click="router.push('ResultDetail/' + scope.row.id)"
            >{{ $t('ResultsTS.lookReport') }}
          </el-button>
        </div>
      </template>
    </el-table-column>
    <el-table-column
      fixed="right"
      :label="$t('common.operate')"
      width="220"
      align="center"
    >
      <template #default="scope">
        <el-popconfirm
          style="margin-left: 10px"
          :confirm-button-text="$t('form.confirm')"
          :cancel-button-text="$t('form.cancel')"
          icon="el-icon-warning"
          icon-color="red"
          :title="$t('ResultsTS.interruptTest')"
          @confirm="forceStopSuite(scope.row.id)"
        >
          <template #reference>
            <el-button
              :disabled="scope.row.status !== 0"
              type="warning"
              size="mini"
              icon="el-icon-video-pause"
              >{{ $t('ResultsTS.interrupt') }}
            </el-button>
          </template>
        </el-popconfirm>
        <el-popconfirm
          style="margin-left: 10px"
          :confirm-button-text="$t('form.confirm')"
          :cancel-button-text="$t('form.cancel')"
          icon="el-icon-warning"
          icon-color="red"
          :title="$t('ResultsTS.del')"
          @confirm="delResult(scope.row.id)"
        >
          <template #reference>
            <el-button type="danger" size="mini" icon="el-icon-delete"
              >{{ $t('common.delete') }}
            </el-button>
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
    @change="getResultList"
  ></pageable>
</template>
