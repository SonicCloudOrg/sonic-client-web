<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';
import axios from '../http/axios';

const { t: $t } = useI18n();
const route = useRoute();
const dialogVisible = ref(false);
const pageData = ref([]);
const updateVersion = ref(null);
const versions = ref({
  id: null,
  projectId: route.params.projectId,
  versionName: '',
  createTime: '',
});
const editVersion = async (id) => {
  await open();
  await getVersionInfo(id);
};
const open = () => {
  versions.value = {
    id: null,
    projectId: route.params.projectId,
    versionName: '',
    createTime: '',
  };
  dialogVisible.value = true;
};
const getVersionList = () => {
  axios
    .get('/controller/versions/list', {
      params: {
        projectId: route.params.projectId,
      },
    })
    .then((resp) => {
      pageData.value = resp.data;
    });
};
const getVersionInfo = (id) => {
  axios
    .get('/controller/versions', {
      params: {
        id,
      },
    })
    .then((resp) => {
      versions.value = resp.data;
    });
};
const deleteVersion = (id) => {
  axios
    .delete('/controller/versions', {
      params: {
        id,
      },
    })
    .then((resp) => {
      if (resp.code === 2000) {
        ElMessage.success({
          message: resp.message,
        });
        getVersionList();
      }
    });
};
const summit = () => {
  updateVersion.value.validate((valid) => {
    if (valid) {
      axios.put('/controller/versions', versions.value).then((resp) => {
        if (resp.code === 2000) {
          ElMessage.success({
            message: resp.message,
          });
          dialogVisible.value = false;
          getVersionList();
        }
      });
    }
  });
};
onMounted(() => {
  getVersionList();
});
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="$t('versionsTS.iteration')"
    width="400px"
  >
    <el-form
      ref="updateVersion"
      :model="versions"
      size="small"
      class="demo-table-expand"
      label-width="90px"
      label-position="left"
    >
      <el-form-item
        prop="versionName"
        :label="$t('versionsTS.name')"
        :rules="{
          required: true,
          message: $t('versionsTS.noNull'),
          trigger: 'blur',
        }"
      >
        <el-input
          v-model="versions.versionName"
          :placeholder="$t('versionsTS.inputName')"
        ></el-input>
      </el-form-item>
      <el-form-item
        :label="$t('versionsTS.time')"
        prop="createTime"
        :rules="{
          required: true,
          message: $t('versionsTS.timeNoNull'),
          trigger: 'change',
        }"
      >
        <el-date-picker
          v-model="versions.createTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          style="width: 100%"
          type="datetime"
          :placeholder="$t('versionsTS.selectTime')"
        ></el-date-picker>
      </el-form-item>
    </el-form>
    <div style="text-align: center">
      <el-button size="small" type="primary" @click="summit">{{
        $t('modulesTS.sure')
      }}</el-button>
    </div>
  </el-dialog>
  <el-button size="mini" round type="primary" @click="open">{{
    $t('versionsTS.addVersions')
  }}</el-button>
  <el-timeline style="margin-top: 20px">
    <el-timeline-item
      v-for="(v, index) in pageData"
      :hollow="true"
      :type="index === 0 ? 'success' : 'info'"
      :timestamp="v.createTime"
      placement="top"
    >
      <el-card>
        <h3 style="margin-top: 5px">{{ v.versionName }}</h3>
        <div>
          <el-button type="primary" size="mini" @click="editVersion(v.id)"
            >{{ $t('common.edit') }}
          </el-button>
          <el-popconfirm
            style="margin-left: 10px"
            :confirm-button-text="$t('form.confirm')"
            :cancel-button-text="$t('form.cancel')"
            icon="el-icon-warning"
            icon-color="red"
            :title="$t('versionsTS.delMessage')"
            @confirm="deleteVersion(v.id)"
          >
            <template #reference>
              <el-button type="danger" size="mini"
                >{{ $t('common.delete') }}
              </el-button>
            </template>
          </el-popconfirm>
        </div>
      </el-card>
    </el-timeline-item>
  </el-timeline>
</template>
