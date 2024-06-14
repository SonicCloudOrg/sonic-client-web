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
  robotType: -1,
  robotToken: '',
  robotSecret: '',
  projectImg: '',
  globalRobot: true,
  testsuiteAlertRobotIds: null,
});
const projectUpdateForm = ref(null);
const dialogDel = ref(false);
const img = import.meta.globEager('./../assets/img/*');
const robotData = ref([]);
const getAlertRobots = () => {
  axios
    .get('/controller/alertRobots/listAll', {
      params: {
        projectId: route.params.projectId,
        scene: 'testsuite',
      },
    })
    .then((resp) => {
      if (resp.code === 2000) {
        robotData.value = resp.data;
      }
    });
};
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
  getAlertRobots();
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
    <el-form-item :label="$t('project.alertConfig')" prop="globalRobot">
      <div style="display: flex; align-items: center">
        <el-switch v-model="project.globalRobot" class="mb-2" />
        <span style="margin-left: 10px">{{
          $t('project.ui.globalRobot')
        }}</span>
      </div>
      <div style="display: flex; align-items: center">
        <el-switch
          v-model="project.testsuiteAlertRobotIds"
          class="mb-2"
          :inactive-value="[]"
          :active-value="null"
        />
        <span style="margin-left: 10px">{{
          $t('project.ui.testsuiteDefaultAlertRobotIds')
        }}</span>
      </div>
      <template v-if="project.testsuiteAlertRobotIds != null">
        <el-select
          v-model="project.testsuiteAlertRobotIds"
          multiple
          clearable
          style="width: 100%"
          :placeholder="$t('robot.ui.botPlaceholder')"
          ><el-option
            v-for="item in robotData"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          ></el-option
        ></el-select>
      </template>
    </el-form-item>
  </el-form>
  <div style="text-align: center">
    <el-button size="medium" type="primary" icon="el-icon-edit" @click="summit"
      >{{ $t('form.save') }}
    </el-button>
    <el-button
      v-if="isUpdate && project.createBy===store.state.userInfo.id"
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
