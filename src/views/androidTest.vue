<script setup>
import {onMounted, ref} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {ElMessage} from 'element-plus';
import {useI18n} from 'vue-i18n';
import axios from '../http/axios';
import Pageable from '../components/Pageable.vue';
import mockData from '../locales/android.json';

const {t: $t} = useI18n();

const route = useRoute();
const router = useRouter();
const pageData = ref({});
const pageSize = ref(15);
const pageCurrNum = ref(1);
const platformOptions = ref([ // 定义平台选项数组
  {label: 'Android', value: 'Android'},
  {label: 'iOS', value: 'iOS'}
]);
const selectedPlatform = ref('');
const appVersion = ref('');
const resultId = ref('');
const caseId = ref('');
const udid = ref('');

const getAndroidList = (pageNum, pSize) => {
  pageSize.value = pSize || pageSize.value;
  pageCurrNum.value = pageNum || pageCurrNum.value;
  // axios
  //   .get('/controller/resultPerformance/list', {
  //     params: {
  //       projectId: route.params.projectId,
  //       page: pageCurrNum.value,
  //       pageSize: pageSize.value,
  //     },
  //   })
  //   .then((resp) => {
  console.log('222', mockData.data)
  pageData.value = mockData.data;
  //   });
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
          getAndroidList();
        }
      });
};
onMounted(() => {
  getAndroidList();
  console.log('123', mockData)
});
</script>

<template>
  <!-- 添加搜索框 -->
  <div style="margin-bottom: 15px;display: flex">
    <el-select
        v-model="selectedPlatform"
        size="mini"
        style="width: 240px"
        :placeholder="$t('resultAndroidTS.platform')"
        @change="getPackageList"
    >
      <el-option
          v-for="item in platformOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
      />
    </el-select>
    <el-input
        v-model="appVersion"
        size="mini"
        style="width: 240px"
        :placeholder="$t('resultAndroidTS.appVersion')"
        @input="getPackageList()"
    />
    <el-input
        v-model="resultId"
        size="mini"
        style="width: 240px"
        :placeholder="$t('resultAndroidTS.resultId')"
        @input="getPackageList()"
    />
    <el-input
        v-model="caseId"
        style="width: 240px"
        size="mini"
        :placeholder="$t('resultAndroidTS.caseId')"
        @input="getPackageList()"
    />
    <el-input
        v-model="udid"
        style="width: 240px"
        size="mini"
        :placeholder="$t('resultAndroidTS.udid')"
        @input="getPackageList()"
    />
    <el-button type="primary" @click="getAndroidList">{{ $t('搜索') }}</el-button>
  </div>
  <el-table :data="pageData['content']" border>
    <el-table-column
        width="80"
        :label="$t('resultAndroidTS.id')"
        prop="id"
        align="center"
        show-overflow-tooltip
    />
    <el-table-column
        width="80"
        :label="$t('resultAndroidTS.name')"
        prop="name"
        align="center"
        show-overflow-tooltip
    />
    <el-table-column
        width="180"
        :label="$t('resultAndroidTS.appVersion')"
        prop="appVersion"
        align="center"
        show-overflow-tooltip
    />
    <el-table-column
        width="180"
        :label="$t('resultAndroidTS.appPackage')"
        prop="appPackage"
        align="center"
        show-overflow-tooltip
    />
    <el-table-column
        width="80"
        :label="$t('resultAndroidTS.fps')"
        prop="fps"
        align="center"
        show-overflow-tooltip
    />
    <el-table-column
        width="160"
        :label="$t('resultAndroidTS.phyRSS')"
        prop="phyRSS"
        align="center"
        show-overflow-tooltip
    />
    <el-table-column
        width="80"
        :label="$t('resultAndroidTS.vmRSS')"
        prop="vmRSS"
        align="center"
        show-overflow-tooltip
    />
    <el-table-column
        width="80"
        :label="$t('resultAndroidTS.totalPSS')"
        prop="totalPSS"
        align="center"
        show-overflow-tooltip
    />
    <el-table-column
        width="80"
        :label="$t('resultAndroidTS.cpu')"
        prop="cpu"
        align="center"
        show-overflow-tooltip
    />
    <el-table-column
        width="80"
        :label="$t('resultAndroidTS.platform')"
        prop="platform"
        align="center"
        show-overflow-tooltip
    />
    <el-table-column
        width="180"
        :label="$t('resultAndroidTS.udid')"
        prop="udid"
        align="center"
        show-overflow-tooltip
    />
    <el-table-column
        width="180"
        :label="$t('resultAndroidTS.createTime')"
        prop="createTime"
        align="center"
        show-overflow-tooltip
    />
  </el-table>
  <pageable
      :is-page-set="true"
      :total="pageData['totalElements']"
      :current-page="pageData['number'] + 1"
      :page-size="pageData['size']"
      @change="getAndroidList"
  ></pageable>
</template>
