<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';
import axios from '../http/axios';
import Pageable from '../components/Pageable.vue';

const { t: $t } = useI18n();

const route = useRoute();
const dialogVisible = ref(false);
const pageData = ref({});
const pageSize = ref(15);
const pageCurrNum = ref(1);
const updateJob = ref(null);
const testSuiteList = ref([]);
const dialogCron = ref(false);
const jobs = ref({
  id: null,
  projectId: route.params.projectId,
  name: '',
  suiteId: null,
  cronExpression: '',
});
const editJobs = async (id) => {
  await open();
  await getJobInfo(id);
};
const open = () => {
  jobs.value = {
    id: null,
    projectId: route.params.projectId,
    name: '',
    suiteId: null,
    cronExpression: '',
  };
  dialogVisible.value = true;
};
const getJobsList = (pageNum, pSize) => {
  pageSize.value = pSize || pageSize.value;
  pageCurrNum.value = pageNum || pageCurrNum.value;
  axios
    .get('/controller/jobs/list', {
      params: {
        projectId: route.params.projectId,
        page: pageCurrNum.value,
        pageSize: pageSize.value,
      },
    })
    .then((resp) => {
      pageData.value = resp.data;
    });
};
const getJobInfo = (id) => {
  axios
    .get('/controller/jobs', {
      params: {
        id,
      },
    })
    .then((resp) => {
      jobs.value = resp.data;
    });
};
const updateStatus = (id, type) => {
  axios
    .get('/controller/jobs/updateStatus', {
      params: {
        id,
        type,
      },
    })
    .then((resp) => {
      if (resp.code === 2000) {
        ElMessage.success({
          message: resp.message,
        });
      }
    });
};
const getSuiteList = () => {
  axios
    .get('/controller/testSuites/listAll', {
      params: {
        projectId: route.params.projectId,
      },
    })
    .then((resp) => {
      testSuiteList.value = resp.data;
    });
};
const deleteJob = (id) => {
  axios
    .delete('/controller/jobs', {
      params: {
        id,
      },
    })
    .then((resp) => {
      if (resp.code === 2000) {
        ElMessage.success({
          message: resp.message,
        });
        getJobsList();
      }
    });
};
const getSuiteName = (id) => {
  let name = '';
  for (const i in testSuiteList.value) {
    if (testSuiteList.value[i].id === id) {
      name = testSuiteList.value[i].name;
      break;
    }
  }
  return name;
};
const summit = () => {
  updateJob.value.validate((valid) => {
    if (valid) {
      axios.put('/controller/jobs', jobs.value).then((resp) => {
        if (resp.code === 2000) {
          ElMessage.success({
            message: resp.message,
          });
          dialogVisible.value = false;
          getJobsList();
        }
      });
    }
  });
};
onMounted(() => {
  getJobsList();
  getSuiteList();
});
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="$t('jobsTS.dialogVisible.message')"
    width="600px"
  >
    <el-form
      ref="updateJob"
      :model="jobs"
      size="small"
      class="demo-table-expand"
      label-width="100px"
      label-position="left"
    >
      <el-form-item
        prop="name"
        :label="$t('jobsTS.dialogVisible.name')"
        :rules="{
          required: true,
          message: $t('jobsTS.dialogVisible.nameIsNull'),
          trigger: 'blur',
        }"
      >
        <el-input
          v-model="jobs.name"
          :placeholder="$t('jobsTS.dialogVisible.inputName')"
        ></el-input>
      </el-form-item>
      <el-form-item
        prop="suiteId"
        :label="$t('routes.testSuite')"
        :rules="{
          required: true,
          message: $t('jobsTS.dialogVisible.testSuiteIsNull'),
          trigger: 'change',
        }"
      >
        <el-select
          v-model="jobs.suiteId"
          style="width: 100%"
          :placeholder="$t('jobsTS.dialogVisible.chooseTestSuite')"
        >
          <el-option
            v-for="item in testSuiteList"
            :key="item['id']"
            :value="item['id']"
            :label="item['name']"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        prop="cronExpression"
        :label="$t('jobsTS.dialogVisible.cron')"
        :rules="{
          required: true,
          message: $t('jobsTS.dialogVisible.cronIsNull'),
          trigger: 'blur',
        }"
      >
        <el-input
          v-model="jobs.cronExpression"
          :placeholder="$t('jobsTS.dialogVisible.inputCron')"
        ></el-input>
      </el-form-item>
    </el-form>
    <div style="text-align: center">
      <el-button size="small" type="primary" @click="summit">{{
        $t('form.confirm')
      }}</el-button>
    </div>
  </el-dialog>
  <el-button size="mini" round type="primary" @click="open">{{
    $t('jobsTS.addCron')
  }}</el-button>
  <el-button size="small" type="text" @click="dialogCron = true"
    >{{ $t('jobsTS.whatCron') }}
  </el-button>
  <el-dialog
    v-model="dialogCron"
    :title="$t('jobsTS.whatCron')"
    width="720px"
    center
  >
    <p>{{ $t('jobsTS.cronInfo.one') }}</p>
    <p>{{ $t('jobsTS.cronInfo.two') }}</p>
    <p>{{ $t('jobsTS.cronInfo.three') }}</p>
    <p>{{ $t('jobsTS.cronInfo.four') }}</p>
    <p>{{ $t('jobsTS.cronInfo.five') }}</p>
    <p>{{ $t('jobsTS.cronInfo.six') }}</p>
    <p>{{ $t('jobsTS.cronInfo.seven') }}</p>
    <p>{{ $t('jobsTS.cronInfo.asterisk') }}</p>
    <p>{{ $t('jobsTS.cronInfo.questionMark') }}</p>
    <p>{{ $t('jobsTS.cronInfo.bar') }}</p>
    <p>
      {{ $t('jobsTS.cronInfo.comma') }}
    </p>
    <p>
      {{ $t('jobsTS.cronInfo.slash') }}
    </p>
    <p>{{ $t('jobsTS.cronInfo.official') }}</p>
    <p>{{ $t('jobsTS.cronInfo.demoOne') }}</p>
    <p>{{ $t('jobsTS.cronInfo.demoTwo') }}</p>
    <p>{{ $t('jobsTS.cronInfo.demoThree') }}</p>
    <p>
      {{ $t('jobsTS.cronInfo.demoFour') }}
    </p>
    <p>{{ $t('jobsTS.cronInfo.demoFive') }}</p>
    <p>
      {{ $t('jobsTS.cronInfo.demoSix') }}
    </p>
    <p></p>
    <p>
      {{ $t('jobsTS.cronInfo.hint') }}
    </p>
  </el-dialog>
  <el-table
    :data="pageData['content']"
    style="width: 100%; margin-top: 20px"
    border
  >
    <el-table-column
      :label="$t('jobsTS.taskId')"
      width="90"
      align="center"
      prop="id"
    ></el-table-column>
    <el-table-column
      :label="$t('jobsTS.dialogVisible.name')"
      width="240"
      align="center"
      prop="name"
    ></el-table-column>
    <el-table-column
      :label="$t('routes.testSuite')"
      width="240"
      align="center"
      prop="suiteId"
    >
      <template #default="scope">
        {{ getSuiteName(scope.row.suiteId) }}
      </template>
    </el-table-column>
    <el-table-column
      :label="$t('jobsTS.dialogVisible.cron')"
      header-align="center"
      prop="cronExpression"
    ></el-table-column>
    <el-table-column :label="$t('agent.status.name')" width="90" align="center">
      <template #default="scope">
        <el-switch
          v-model="scope.row.status"
          active-color="#13ce66"
          :active-value="1"
          :inactive-value="2"
          @change="updateStatus(scope.row.id, scope.row.status === 1 ? 1 : 2)"
        >
        </el-switch>
      </template>
    </el-table-column>
    <el-table-column :label="$t('common.operate')" width="290" align="center">
      <template #default="scope">
        <el-button
          type="success"
          size="mini"
          @click="updateStatus(scope.row.id, 3)"
          >{{ $t('jobsTS.run') }}
        </el-button>
        <el-button type="primary" size="mini" @click="editJobs(scope.row.id)"
          >{{ $t('common.edit') }}
        </el-button>
        <el-popconfirm
          style="margin-left: 10px"
          :confirm-button-text="$t('form.confirm')"
          :cancel-button-text="$t('form.cancel')"
          icon="el-icon-warning"
          icon-color="red"
          :title="$t('jobsTS.del')"
          @confirm="deleteJob(scope.row.id)"
        >
          <template #reference>
            <el-button type="danger" size="mini"
              >{{ $t('common.delete') }}
            </el-button>
          </template>
        </el-popconfirm>
      </template>
    </el-table-column>
  </el-table>
  <pageable
    :is-page-set="true"
    :total="pageData['totalElements']"
    :current-page="pageData['number'] + 1"
    :page-size="pageData['size']"
    @change="getJobsList"
  ></pageable>
</template>
