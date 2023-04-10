<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';
import axios from '../http/axios';

const { t: $t } = useI18n();
const props = defineProps({
  projectId: Number,
  elementId: Number,
  elementObj: Object,
});
const emit = defineEmits(['flush']);
const element = ref({
  id: null,
  eleName: '',
  eleType: '',
  eleValue: '',
  moduleId: 0,
  projectId: props.projectId,
});
const updateEle = ref(null);
const beforeAvatarUpload = (file) => {
  if (file.name.endsWith('.jpg') || file.name.endsWith('.png')) {
    return true;
  }
  ElMessage.error({
    message: $t('dialog.suffixError'),
  });
  return false;
};
const limitOut = () => {
  ElMessage.error({
    message: $t('androidRemoteTS.addOne'),
  });
};
const upload = (content) => {
  const formData = new FormData();
  formData.append('file', content.file);
  formData.append('type', 'keepFiles');
  axios
    .post('/folder/upload', formData, {
      headers: { 'Content-type': 'multipart/form-data' },
    })
    .then((resp) => {
      if (resp.code === 2000) {
        ElMessage.success({
          message: resp.message,
        });
        element.value.eleValue = resp.data;
      }
    });
};
const getElementInfo = (id) => {
  axios
    .get('/controller/elements', {
      params: {
        id,
      },
    })
    .then((resp) => {
      element.value = resp.data;
    });
};
const saveElement = () => {
  updateEle.value.validate((valid) => {
    if (valid) {
      axios.put('/controller/elements', element.value).then((resp) => {
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
const moduleList = ref([]);
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
onMounted(() => {
  if (props.elementId !== 0) {
    getElementInfo(props.elementId);
  }
  if (props.elementObj) {
    element.value.eleType = props.elementObj.eleType;
    element.value.eleValue = props.elementObj.eleValue;
  }
  getModuleList();
});
</script>

<template>
  <el-alert
    style="margin-bottom: 10px"
    :title="$t('element.paramTip')"
    type="info"
    show-icon
    close-text="Get!"
  >
  </el-alert>
  <el-form
    ref="updateEle"
    :model="element"
    size="small"
    class="demo-table-expand"
    label-width="90px"
    label-position="left"
  >
    <el-form-item
      prop="eleName"
      :label="$t('element.name')"
      :rules="{
        required: true,
        message: $t('element.nameMsg'),
        trigger: 'blur',
      }"
    >
      <el-input
        v-model="element.eleName"
        :placeholder="$t('element.nameMsg')"
      ></el-input>
    </el-form-item>
    <el-form-item prop="eleType" :label="$t('element.type')">
      <el-select
        v-model="element.eleType"
        style="width: 100%"
        :placeholder="$t('element.typePlace')"
      >
        <el-option-group :label="$t('element.deviceType')">
          <el-option label="id（resource-id）" value="id"></el-option>
          <el-option value="xpath"></el-option>
          <el-option value="accessibilityId"></el-option>
          <el-option
            label="nsPredicate（Only iOS）"
            value="nsPredicate"
          ></el-option>
          <el-option
            label="classChain（Only iOS）"
            value="classChain"
          ></el-option>
          <el-option
            label="uiautomator（Only Android）"
            value="androidUIAutomator"
          ></el-option>
        </el-option-group>
        <el-option-group :label="$t('element.specType')">
          <el-option :label="$t('element.point')" value="point"></el-option>
          <el-option :label="$t('element.poco')" value="poco"></el-option>
          <el-option :label="$t('element.image')" value="image"></el-option>
        </el-option-group>
        <el-option-group :label="$t('element.webViewType')">
          <el-option value="name"></el-option>
          <el-option value="cssSelector"></el-option>
          <el-option value="linkText"></el-option>
          <el-option value="className"></el-option>
          <el-option value="tagName"></el-option>
          <el-option value="partialLinkText"></el-option>
          <el-option value="cssSelectorAndText"></el-option>
        </el-option-group>
      </el-select>
    </el-form-item>
    <el-form-item prop="eleValue" :label="$t('element.value')">
      <el-upload
        v-if="element.eleType === 'image'"
        drag
        action=""
        :with-credentials="true"
        :limit="1"
        :before-upload="beforeAvatarUpload"
        :on-exceed="limitOut"
        :http-request="upload"
        list-type="picture"
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">
          {{ $t('androidRemoteTS.code.messageFive')
          }}<em>{{ $t('devices.detail.uploadImg') }}</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            {{ $t('androidRemoteTS.code.messageFour') }}
          </div>
        </template>
      </el-upload>
      <el-input
        v-else
        v-model="element.eleValue"
        type="textarea"
        autosize
        :placeholder="$t('element.valuePlace')"
      ></el-input>
    </el-form-item>
    <el-form-item :label="$t('element.model')">
      <el-select
        v-model="element.moduleId"
        style="width: 100%"
        :placeholder="$t('element.modelPlace')"
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
    <div style="text-align: center">
      <el-button size="small" type="primary" @click="saveElement">{{
        $t('form.save')
      }}</el-button>
    </div>
  </el-form>
</template>
