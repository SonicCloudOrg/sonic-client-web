<script setup>
import { onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import defaultLogo from '../assets/logo.png';

import axios from '../http/axios';

const { t: $t } = useI18n();

const img = import.meta.globEager('./../assets/img/*');
const props = defineProps({
  projectId: Number,
  platform: Number,
  caseId: Number,
});
const store = useStore();
const testCase = ref({
  id: null,
  name: '',
  platform: props.platform,
  projectId: props.projectId,
  moduleId: 0,
  version: '',
  designer: '',
  des: '',
});
const moduleList = ref([]);
const versionList = ref([]);
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
const platformList = [
  { name: 'Android', value: 1, img: 'ANDROID' },
  { name: 'iOS', value: 2, img: 'IOS' },
];
const emit = defineEmits(['flush']);
const caseForm = ref(null);
const summit = () => {
  caseForm.value.validate((valid) => {
    if (valid) {
      axios.put('/controller/testCases', testCase.value).then((resp) => {
        if (resp.code === 2000) {
          ElMessage.success({
            message: resp.message,
          });
          emit('flush');
        }
      });
    }
  });
};
const getCaseInfo = (id) => {
  axios.get('/controller/testCases', { params: { id } }).then((resp) => {
    if (resp.code === 2000) {
      testCase.value = resp.data;
    }
  });
};
const getModuleList = () => {
  axios
    .get('/controller/modules/list', { params: { projectId: props.projectId } })
    .then((resp) => {
      if (resp.code === 2000) {
        moduleList.value = resp.data;
        moduleList.value.push({ id: 0, name: $t('common.null') });
      }
    });
};
const getVersionList = (e) => {
  if (e) {
    axios
      .get('/controller/versions/list', {
        params: { projectId: props.projectId },
      })
      .then((resp) => {
        if (resp.code === 2000) {
          versionList.value = resp.data;
        }
      });
  }
};
onMounted(() => {
  if (props.caseId !== 0) {
    getCaseInfo(props.caseId);
  }
  getModuleList();
});
</script>

<template>
  <el-form
    ref="caseForm"
    label-position="left"
    class="demo-table-expand"
    label-width="90px"
    :model="testCase"
    size="small"
  >
    <el-form-item
      prop="name"
      :label="$t('testcase.name')"
      :rules="{
        required: true,
        message: $t('testcase.nameMsg'),
        trigger: 'blur',
      }"
    >
      <el-input
        v-model="testCase.name"
        size="mini"
        :placeholder="$t('testcase.nameMsg')"
      />
    </el-form-item>
    <el-form-item
      prop="projectId"
      :label="$t('testcase.project')"
      :rules="{
        required: true,
        message: $t('testcase.projectPlace'),
        trigger: 'change',
      }"
    >
      <el-select
        v-model="testCase.projectId"
        :placeholder="$t('testcase.projectPlace')"
      >
        <el-option
          v-for="item in store.state.projectList"
          :key="item.id"
          :value="item.id"
          :label="item['projectName']"
        >
          <div style="display: flex; align-items: center">
            <el-avatar
              style="margin-right: 10px"
              :size="32"
              :src="
                item['projectImg'].length > 0 ? item['projectImg'] : defaultLogo
              "
              shape="square"
            ></el-avatar>
            {{ item['projectName'] }}
          </div>
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item
      prop="platform"
      :label="$t('testcase.platform')"
      :rules="{
        required: true,
        message: $t('testcase.platformPlace'),
        trigger: 'change',
      }"
    >
      <el-select
        v-model="testCase.platform"
        :placeholder="$t('testcase.platformPlace')"
      >
        <el-option
          v-for="item in platformList"
          :key="item.name"
          :value="item.value"
          :label="item.name"
          :disabled="item.disabled"
        >
          <div
            style="display: flex; align-items: center; justify-content: center"
          >
            <el-avatar
              style="margin-right: 10px"
              :size="32"
              :src="getImg(item.img)"
              shape="square"
            ></el-avatar>
            {{ item.name }}
          </div>
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('testcase.modelLabel')">
      <el-select
        v-model="testCase.moduleId"
        :placeholder="$t('testcase.modelPlace')"
      >
        <el-option
          v-for="item in moduleList"
          :key="item.name"
          :value="item.id"
          :label="item.name"
        >
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('testcase.versionLabel')">
      <el-select
        v-model="testCase.version"
        :placeholder="$t('testcase.versionPlace')"
        @visible-change="getVersionList"
      >
        <el-option
          v-for="item in versionList"
          :key="item['versionName']"
          :value="item['versionName']"
          :label="item['versionName']"
        ></el-option>
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('testcase.des')">
      <el-input
        v-model="testCase.des"
        :autosize="{ minRows: 3, maxRows: 7 }"
        :maxlength="240"
        show-word-limit
        type="textarea"
        size="mini"
        :placeholder="$t('testcase.desPlace')"
      />
    </el-form-item>
  </el-form>
  <div style="text-align: center; margin-top: 20px">
    <el-button size="small" type="primary" @click="summit">{{
      $t('form.save')
    }}</el-button>
  </div>
</template>
