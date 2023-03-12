<script setup>
import { onMounted, ref } from 'vue';
import axios from '@/http/axios';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';

const { t: $t } = useI18n();

const sysLogs = ref([]);

const dialogVisible = ref(false);

const findSysJobs = () => {
  axios.get('/controller/jobs/findSysJobs').then((resp) => {
    sysLogs.value = resp.data;
  });
};

const open = (type, cron) => {
  edit.value = { type, cron };
  dialogVisible.value = true;
};

const edit = ref({
  type: '',
  cron: '',
});

const updateSysJob = () => {
  axios.put('/controller/jobs/updateSysJob', edit.value).then((resp) => {
    if (resp.code === 2000) {
      dialogVisible.value = false;
      ElMessage.success({
        message: resp.message,
      });
      findSysJobs();
    }
  });
};

const getInfo = (type) => {
  let result = {
    name: '',
    des: '',
  };
  switch (type) {
    case 'cleanFile':
      result = {
        name: $t('sysJobsTS.code.cleanFile'),
        des: $t('sysJobsTS.code.cleanFileText'),
      };
      break;
    case 'cleanResult':
      result = {
        name: $t('sysJobsTS.code.cleanResult'),
        des: $t('sysJobsTS.code.cleanResultText'),
      };
      break;
    case 'sendDayReport':
      result = {
        name: $t('sysJobsTS.code.sendDayReport'),
        des: $t('sysJobsTS.code.sendDayReportText'),
      };
      break;
    case 'sendWeekReport':
      result = {
        name: $t('sysJobsTS.code.sendWeekReport'),
        des: $t('sysJobsTS.code.sendWeekReportText'),
      };
      break;
  }
  return result;
};

onMounted(() => {
  findSysJobs();
});
</script>

<template>
  <el-table :data="sysLogs" style="width: 100%" border>
    <el-table-column
      :label="$t('sysJobsTS.page.type')"
      width="190"
      align="center"
      prop="type"
    >
      <template #default="scope">
        {{ getInfo(scope.row.type).name }}
      </template>
    </el-table-column>
    <el-table-column
      :label="$t('resourceTS.pageData.message')"
      show-overflow-tooltip
      header-align="center"
      prop="type"
    >
      <template #default="scope">
        {{ getInfo(scope.row.type).des }}
      </template>
    </el-table-column>
    <el-table-column
      :label="$t('routes.timedTask')"
      width="250"
      align="center"
      prop="cron"
    ></el-table-column>
    <el-table-column
      :label="$t('sysJobsTS.page.nextTriggerDate')"
      width="450"
      align="center"
      prop="cronNext"
    >
      <template #default="scope">
        {{ new Date(scope.row['cronNext']) }}
      </template>
    </el-table-column>
    <el-table-column :label="$t('common.operate')" width="150" align="center">
      <template #default="scope">
        <el-button
          size="mini"
          type="primary"
          @click="open(scope.row.type, scope.row.cron)"
          >{{ $t('common.edit') }}</el-button
        >
      </template>
    </el-table-column>
  </el-table>

  <el-dialog
    v-model="dialogVisible"
    :title="$t('sysJobsTS.page.editTime')"
    width="600px"
  >
    <el-form
      ref="updateRoles"
      :model="edit"
      size="small"
      class="demo-table-expand"
      label-width="90px"
      label-position="left"
    >
      <el-form-item :label="$t('jobsTS.dialogVisible.cron')">
        <el-input v-model="edit.cron"></el-input>
      </el-form-item>
    </el-form>
    <div style="text-align: center">
      <el-button size="small" type="primary" @click="updateSysJob">{{
        $t('modulesTS.sure')
      }}</el-button>
    </div>
  </el-dialog>
</template>
