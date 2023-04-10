<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import useClipboard from 'vue-clipboard3';
import { useI18n } from 'vue-i18n';
import jenkins from '../assets/img/jenkins.png';
import axios from '../http/axios';
import Pageable from '../components/Pageable.vue';

const { t: $t } = useI18n();

const { toClipboard } = useClipboard();

const route = useRoute();
const router = useRouter();
const pageData = ref({});
const pageSize = ref(15);
const pageCurrNum = ref(1);
const platform = ref('');
const branch = ref('');

const getPackageList = (pageNum, pSize) => {
  pageSize.value = pSize || pageSize.value;
  pageCurrNum.value = pageNum || pageCurrNum.value;
  axios
    .get('/controller/packages/list', {
      params: {
        projectId: route.params.projectId,
        page: pageCurrNum.value,
        pageSize: pageSize.value,
        platform: platform.value,
        branch: branch.value,
      },
    })
    .then((resp) => {
      pageData.value = resp.data;
    });
};

const filter = (e) => {
  platform.value = e.platform[0];
  getPackageList();
};

const copy = (value) => {
  try {
    toClipboard(value);
    ElMessage.success({
      message: $t('dialog.copy.success'),
    });
  } catch (e) {
    ElMessage.error({
      message: $t('dialog.copy.fail'),
    });
  }
};
const getBuildId = (data) => {
  if (data && data != null && data.length > 0 && data.indexOf('/') >= 2) {
    return data.substring(
      data.substring(0, data.lastIndexOf('/')).lastIndexOf('/') + 1,
      data.length - 1
    );
  }
  return '';
};
onMounted(() => {
  getPackageList();
});
</script>

<template>
  <a
    style="float: right; margin-bottom: 20px"
    href="https://sonic-cloud.cn/sch"
    target="_blank"
  >
    <el-button size="mini" plain type="primary">{{
      $t('packagesTS.accessGuide')
    }}</el-button></a
  >
  <el-table :data="pageData['content']" border @filter-change="filter">
    <el-table-column
      width="80"
      label="Id"
      prop="id"
      align="center"
      show-overflow-tooltip
    />
    <el-table-column
      width="110"
      :label="$t('packagesTS.buildLink')"
      prop="buildUrl"
      align="center"
    >
      <template #default="scope">
        <div
          style="display: flex; align-items: center; justify-content: center"
        >
          <el-image :src="jenkins" style="width: 28px" />
          <el-link :href="scope.row.buildUrl" target="_blank" type="primary">
            <strong>#{{ getBuildId(scope.row.buildUrl) }}</strong>
          </el-link>
        </div>
      </template>
    </el-table-column>
    <el-table-column
      :label="$t('packagesTS.platform')"
      width="120"
      prop="platform"
      align="center"
      :filter-multiple="false"
      column-key="platform"
      :filters="[
        { text: 'Android', value: 'Android' },
        { text: 'iOS', value: 'iOS' },
      ]"
    >
      <template #default="scope">
        <span v-if="scope.row.platform.length === 0">{{
          $t('packagesTS.no')
        }}</span>
        <span v-else>
          <el-tag size="small">{{ scope.row.platform.toUpperCase() }}</el-tag>
        </span>
      </template>
    </el-table-column>
    <el-table-column
      :label="$t('packagesTS.packageName')"
      prop="pkgName"
      header-align="center"
      show-overflow-tooltip
    >
    </el-table-column>
    <el-table-column
      :label="$t('packagesTS.branch')"
      width="280"
      prop="branch"
      align="center"
    >
      <template #header>
        <el-input
          v-model="branch"
          size="mini"
          :placeholder="$t('packagesTS.inputName')"
          @input="getPackageList()"
        />
      </template>
    </el-table-column>
    <el-table-column
      :label="$t('packagesTS.downloadLink')"
      width="180"
      prop="url"
      align="center"
    >
      <template #default="scope">
        <el-button type="primary" size="mini" @click="copy(scope.row.url)"
          >{{ $t('packagesTS.copyUrl') }}
        </el-button>
      </template>
    </el-table-column>
    <el-table-column
      :label="$t('packagesTS.creatTime')"
      width="200"
      prop="createTime"
      align="center"
    >
    </el-table-column>
  </el-table>
  <pageable
    :is-page-set="true"
    :total="pageData['totalElements']"
    :current-page="pageData['number'] + 1"
    :page-size="pageData['size']"
    @change="getPackageList"
  ></pageable>
</template>
