<script setup>
import { useRoute, useRouter } from 'vue-router';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import axios from '../http/axios';
import StepList from '../components/StepList.vue';

const { t: $t } = useI18n();

const img = import.meta.globEager('./../assets/img/*');
const route = useRoute();
const router = useRouter();
const testCase = ref({});
const getImg = (name) => {
  let result;
  if (name === 'meizu') {
    name = 'Meizu';
  }
  if (name === 'LENOVO') {
    name = 'Lenovo';
  }
  try {
    result = img[`./../assets/img/${name}.jpg`].default;
  } catch {
    result = img['./../assets/img/unName.jpg'].default;
  }
  return result;
};
const getCaseInfo = (id) => {
  axios
    .get('/controller/testCases', {
      params: {
        id,
      },
    })
    .then((resp) => {
      if (resp.code === 2000) {
        testCase.value = resp.data;
      }
    });
};
onMounted(() => {
  getCaseInfo(route.params.caseId);
});
</script>

<template>
  <el-page-header
    :content="$t('publicStepTS.stepInfo')"
    style="margin-bottom: 20px"
    @back="router.go(-1)"
  >
  </el-page-header>
  <el-row :gutter="20">
    <el-col :span="6">
      <el-card>
        <template #header
          ><strong>{{ $t('stepListViewTS.caseInfo') }}</strong></template
        >
        <el-form
          v-if="testCase['id']"
          label-position="left"
          class="demo-table-expand"
          label-width="100px"
          style="margin-left: 10px; word-break: break-all"
        >
          <el-form-item :label="$t('projectIndexTS.page.caseId')">
            <span>{{ testCase['id'] }}</span>
          </el-form-item>
          <el-form-item :label="$t('projectIndexTS.page.caseName')">
            <span>{{ testCase.name }}</span>
          </el-form-item>
          <el-form-item :label="$t('stepListViewTS.platformToBe')">
            <div style="display: flex; align-items: center">
              <el-avatar
                style="margin-right: 10px"
                :size="27"
                :src="getImg(testCase['platform'] === 1 ? 'ANDROID' : 'IOS')"
                shape="square"
              ></el-avatar>
              {{
                testCase['platform'] === 1 ? $t('publicStepTS.android') : 'iOS'
              }}
            </div>
          </el-form-item>
          <el-form-item :label="$t('stepListViewTS.module')">
            <span>{{
              testCase['modulesDTO'] !== null ? testCase['modulesDTO'].name : ''
            }}</span>
          </el-form-item>
          <el-form-item :label="$t('stepListViewTS.versionName')">
            <span>{{ testCase['version'] }}</span>
          </el-form-item>
          <el-form-item :label="$t('stepListViewTS.designer')">
            <span>{{ testCase['designer'] }}</span>
          </el-form-item>
          <el-form-item :label="$t('stepListViewTS.last')">
            <span>{{ testCase['editTime'] }}</span>
          </el-form-item>
          <el-form-item :label="$t('stepListViewTS.testMessage')">
            <span>{{ testCase['des'] }}</span>
          </el-form-item>
        </el-form>
      </el-card>
    </el-col>
    <el-col :span="18">
      <el-card shadow="hover">
        <step-list
          v-if="testCase['id']"
          :is-show-run="false"
          :platform="testCase['platform']"
          :is-driver-finish="false"
          :case-id="testCase['id']"
          :project-id="route.params.projectId"
        />
      </el-card>
    </el-col>
  </el-row>
</template>
