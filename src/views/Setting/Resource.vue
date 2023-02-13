<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import axios from '@/http/axios';
import { ElMessage } from 'element-plus';
import Pageable from '@/components/Pageable.vue';
import { useI18n } from 'vue-i18n';

const { t: $t } = useI18n();
const route = useRoute();

const pageData = ref({});
const pageSize = ref(15);
const pageCurrNum = ref(1);
const path = ref('');

const updateStatus = (id, needAuth) => {
  axios
    .put('/controller/resources/edit', {
      id,
      needAuth,
    })
    .then((resp) => {
      if (resp.code === 2000) {
        ElMessage.success({
          message: resp.message,
        });
      }
    });
};

const refresh = (id, needAuth) => {
  axios
    .post('/controller/resources/refresh', {
      id,
      needAuth,
    })
    .then((resp) => {
      if (resp.code === 2000) {
        pageData.value = resp.data;
        ElMessage.success({
          message: $t('resourceTS.syncSucceed'),
        });
      }
    });
};

const getResourceList = (pageNum, pSize) => {
  pageSize.value = pSize || pageSize.value;
  pageCurrNum.value = pageNum || pageCurrNum.value;
  axios
    .get('/controller/resources/list', {
      params: {
        page: pageCurrNum.value,
        pageSize: pageSize.value,
        path: path.value,
      },
    })
    .then((resp) => {
      pageData.value = resp.data;
    });
};

onMounted(() => {
  getResourceList();
});
</script>

<template>
  <el-button
    size="mini"
    style="margin-bottom: 10px"
    round
    type="primary"
    @click="refresh"
    >{{ $t('resourceTS.syncResource') }}</el-button
  >
  <el-alert
    style="margin-bottom: 10px"
    :title="$t('resourceTS.syncResourceInfo')"
    :description="$t('resourceTS.syncResourceInfoMessage')"
    type="info"
    show-icon
    close-text="Get!"
  />

  <el-table
    :data="pageData['content']"
    style="width: 100%; margin-top: 20px"
    border
  >
    <el-table-column
      :label="$t('resourceTS.pageData.idText')"
      width="90"
      align="center"
      prop="id"
    ></el-table-column>
    <el-table-column
      :label="$t('resourceTS.pageData.message')"
      align="center"
      prop="desc"
    ></el-table-column>
    <el-table-column
      :label="$t('resourceTS.pageData.path')"
      align="center"
      prop="path"
    >
      <template #header>
        <el-input
          v-model="path"
          size="mini"
          :placeholder="$t('resourceTS.pageData.inputPathName')"
          @input="getResourceList(1)"
        />
      </template>
    </el-table-column>
    <el-table-column
      :label="$t('resourceTS.pageData.callMethod')"
      width="80"
      header-align="center"
      prop="method"
    ></el-table-column>
    <el-table-column
      :label="$t('resourceTS.pageData.requiredText')"
      width="120"
      align="center"
    >
      <template #default="scope">
        <el-switch
          v-model="scope.row.needAuth"
          active-color="#13ce66"
          :active-value="1"
          :inactive-value="0"
          @change="updateStatus(scope.row.id, scope.row.needAuth === 1)"
        >
        </el-switch>
      </template>
    </el-table-column>
  </el-table>
  <pageable
    :is-page-set="true"
    :total="pageData['totalElements']"
    :current-page="pageData['number'] + 1"
    :page-size="pageData['size']"
    @change="getResourceList"
  ></pageable>
</template>
