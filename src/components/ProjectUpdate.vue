<script setup>
import { onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import axios from '../http/axios';

const { t: $t } = useI18n();
const props = defineProps({
  isUpdate: Boolean,
});
const store = useStore();
const route = useRoute();
const router = useRouter();
const project = ref({
  id: null,
  projectName: '',
  projectDes: '',
  robotType: 1,
  robotToken: '',
  robotSecret: '',
  projectImg: '',
});
const projectUpdateForm = ref(null);
const dialogDel = ref(false);
const img = import.meta.globEager('./../assets/img/*');
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
const robotList = [
  { name: '钉钉群机器人', value: 1, img: 'DingTalk' },
  { name: '企业微信机器人', value: 2, img: 'WeChat' },
  { name: '飞书群机器人', value: 3, img: 'FeiShu' },
  { name: '友空间机器人', value: 4, img: 'You' },
  { name: 'Telegram Bot', value: 5, img: 'Telegram' },
  { name: 'LINE Notify', value: 6, img: 'LineNotify' },
  { name: 'Slack Bot', value: 7, img: 'SlackBot' },
];
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
        project.value.projectImg = resp.data;
      }
    });
};
const emit = defineEmits(['flush']);
const summit = () => {
  projectUpdateForm.value.validate((valid) => {
    if (valid) {
      axios.put('/controller/projects', project.value).then((resp) => {
        if (resp.code === 2000) {
          ElMessage.success({
            message: resp.message,
          });
          if (props.isUpdate) {
            store.commit('saveProject', project.value);
          }
          emit('flush');
        }
      });
    }
  });
};
const fullscreenLoading = ref(false);
const delProject = () => {
  fullscreenLoading.value = true;
  axios
    .delete('/controller/projects', { params: { id: route.params.projectId } })
    .then((resp) => {
      fullscreenLoading.value = false;
      if (resp.code === 2000) {
        ElMessage.success({
          message: resp.message,
        });
        dialogDel.value = false;
        router.push('/');
      }
    });
};
onMounted(() => {
  if (props.isUpdate) {
    project.value = JSON.parse(JSON.stringify(store.state.project));
  }
});
</script>

<template>
  <el-form
    ref="projectUpdateForm"
    :model="project"
    label-width="100px"
    class="project-table-expand"
  >
    <el-form-item :label="$t('project.logo')" prop="projectImg">
      <el-upload
        action=""
        list-type="picture-card"
        :with-credentials="true"
        :limit="1"
        :before-upload="beforeAvatarUpload"
        :on-exceed="limitOut"
        :http-request="upload"
      >
        <i class="el-icon-plus"></i>
      </el-upload>
    </el-form-item>
    <el-form-item
      :label="$t('project.name')"
      prop="projectName"
      :rules="{
        required: true,
        message: $t('project.nameMessage'),
        trigger: 'blur',
      }"
    >
      <el-input
        v-model="project.projectName"
        :placeholder="$t('project.namePlace')"
      ></el-input>
    </el-form-item>
    <el-form-item :label="$t('project.des')" prop="projectDes">
      <el-input
        v-model="project.projectDes"
        type="textarea"
        :rows="5"
        :placeholder="$t('project.desPlace')"
      ></el-input>
    </el-form-item>
    <el-form-item :label="$t('robot.robotType')">
      <el-select
        v-model="project.robotType"
        style="width: 100%"
        :placeholder="$t('robot.robotTypePlaceholder')"
      >
        <el-option
          v-for="item in robotList"
          :key="item.name"
          :value="item.value"
          :label="item.name"
          :disabled="item['disabled']"
        >
          <div style="display: flex; align-items: center">
            <el-avatar
              style="margin-right: 10px"
              :size="30"
              :src="getImg(item.img)"
              shape="square"
            ></el-avatar>
            {{ item.name }}
          </div>
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('robot.robotToken')" prop="robotToken">
      <el-input
        v-model="project.robotToken"
        :placeholder="$t('robot.robotTokenPlaceholder')"
      ></el-input>
    </el-form-item>
    <el-form-item :label="$t('robot.robotSecret')" prop="robotSecret">
      <el-input
        v-model="project.robotSecret"
        :placeholder="$t('robot.robotSecretPlaceholder')"
        type="password"
      ></el-input>
    </el-form-item>
  </el-form>
  <div style="text-align: center">
    <el-button size="medium" type="primary" icon="el-icon-edit" @click="summit"
      >{{ $t('form.save') }}
    </el-button>
    <el-button
      v-if="isUpdate"
      type="danger"
      size="medium"
      icon="el-icon-delete"
      @click="dialogDel = true"
      >{{ $t('project.delete') }}
    </el-button>
  </div>
  <el-dialog v-model="dialogDel" width="25%" center>
    <div style="text-align: center">
      <p>{{ $t('project.deleteConfirmMsg') }}</p>
      <p style="color: red">
        <i class="el-icon-warning">{{ $t('project.deleteConfirmMsgDes') }}</i>
      </p>
    </div>
    <template #footer>
      <el-button size="small" @click="dialogDel = false">{{
        $t('form.cancel')
      }}</el-button>
      <el-button
        v-loading.fullscreen.lock="fullscreenLoading"
        size="small"
        type="danger"
        @click="delProject"
        >{{ $t('form.confirm') }}
      </el-button>
    </template>
  </el-dialog>
</template>
