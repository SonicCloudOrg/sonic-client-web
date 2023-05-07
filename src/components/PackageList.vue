<script setup>
import { ref, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import Pageable from './Pageable.vue';
import axios from '../http/axios';

const props = defineProps({
  projectId: Number,
  platformType: String,
});
const { t: $t } = useI18n();
const pageData = ref({});
const pageSize = ref(8);
const pageCurrNum = ref(1);
const tableLoading = ref(false);
const branch = ref('');
const packageName = ref('');
// 拉取安装包信息的请求
const getPackageInfoList = (pageNum, pSize) => {
  tableLoading.value = true;
  pageSize.value = pSize || pageSize.value;
  pageCurrNum.value = pageNum || pageCurrNum.value;
  axios
    .get('/controller/packages/list', {
      params: {
        projectId: props.projectId,
        platform: props.platformType,
        page: pageCurrNum.value,
        pageSize: pageSize.value,
        branch: branch.value,
        packageName: packageName.value,
      },
    })
    .then((resp) => {
      pageData.value = resp.data;
      tableLoading.value = false;
    });
};
// 点击事件发送
const emit = defineEmits(['selectPackage']);
const selectPackage = (row, column, event) => {
  emit('selectPackage', row.url);
};
watch(
  () => props.projectId,
  () => {
    getPackageInfoList();
  }
);
onMounted(() => {
  getPackageInfoList();
});
</script>

<template>
  <el-table
    v-loading="tableLoading"
    :data="pageData['content']"
    border
    :row-style="{}"
    style="margin-top: 15px"
    @row-click="selectPackage"
  >
    <el-table-column
      width="100"
      label="id"
      prop="id"
      align="center"
      show-overflow-tooltip
    />
    <!--安装包名称列，支持筛选-->>
    <el-table-column
      min-width="240"
      prop="pkgName"
      header-align="center"
      show-overflow-tooltip
    >
      <template #header>
        <el-input
          v-model="packageName"
          size="mini"
          :placeholder="$t('packagesTS.packageName')"
          @input="getPackageInfoList()"
        />
      </template>
    </el-table-column>
    <!--分支名称列，支持筛选-->>
    <el-table-column
      min-width="120"
      prop="branch"
      align="center"
    >
    <template #header>
        <el-input
          v-model="branch"
          size="mini"
          :placeholder="$t('packagesTS.branch')"
          @input="getPackageInfoList()"
        />
      </template>
    </el-table-column>
    <!--更新时间列-->>
    <el-table-column
      min-width="80"
      :label="$t('packagesTS.updateTime')"
      prop="updateTime"
      align="center"
      show-overflow-tooltip
    />
  </el-table>
  <pageable
    :is-page-set="false"
    :total="pageData['totalElements']"
    :current-page="pageData['number'] + 1"
    :page-size="pageData['size']"
    @change="getPackageInfoList"
  ></pageable>
</template>
