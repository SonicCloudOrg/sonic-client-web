<script setup>
import {onMounted, ref} from "vue";
import {useRoute} from "vue-router";
import axios from "../http/axios";
import {ElMessage} from "element-plus";
import Pageable from '../components/Pageable.vue'

const route = useRoute()
const dialogVisible = ref(false)
const pageData = ref({})
const pageSize = ref(15);
const updateJob = ref(null)
const testSuiteList = ref([])
const dialogCron = ref(false)
const jobs = ref({
  id: null,
  projectId: route.params.projectId,
  name: "",
  suiteId: null,
  cronExpression: ""
})
const editJobs = async (id) => {
  await open()
  await getJobInfo(id)
}
const open = () => {
  jobs.value = {
    id: null,
    projectId: route.params.projectId,
    name: "",
    suiteId: null,
    cronExpression: ""
  }
  dialogVisible.value = true
}
const getJobsList = (pageNum, pSize) => {
  axios.get("/controller/jobs/list", {
    params: {
      projectId: route.params.projectId,
      page: pageNum || 1,
      pageSize: pSize || pageSize.value,
    }
  }).then(resp => {
    pageData.value = resp.data
  })
}
const getJobInfo = (id) => {
  axios.get("/controller/jobs", {
    params: {
      id
    }
  }).then(resp => {
    jobs.value = resp.data
  })
}
const updateStatus = (id, type) => {
  axios.get("/controller/jobs/updateStatus", {
    params: {
      id, type
    }
  }).then(resp => {
    if (resp['code'] === 2000) {
      ElMessage.success({
        message: resp['message'],
      });
    }
  })
}
const getSuiteList = () => {
  axios.get("/controller/testSuites/listAll", {
    params: {
      projectId: route.params.projectId
    }
  }).then(resp => {
    testSuiteList.value = resp.data
  })
}
const deleteJob = (id) => {
  axios.delete("/controller/jobs", {
    params: {
      id
    }
  }).then(resp => {
    if (resp['code'] === 2000) {
      ElMessage.success({
        message: resp['message'],
      });
      getJobsList();
    }
  })
}
const getSuiteName = (id) => {
  let name = ""
  for (let i in testSuiteList.value) {
    if (testSuiteList.value[i].id === id) {
      name = testSuiteList.value[i].name
      break
    }
  }
  return name
}
const summit = () => {
  updateJob['value'].validate((valid) => {
    if (valid) {
      axios.put("/controller/jobs", jobs.value).then(resp => {
        if (resp['code'] === 2000) {
          ElMessage.success({
            message: resp['message'],
          });
          dialogVisible.value = false
          getJobsList();
        }
      })
    }
  })
}
onMounted(() => {
  getJobsList();
  getSuiteList();
})
</script>
<template>
  <el-dialog v-model="dialogVisible" title="定时任务信息" width="600px">
    <el-form ref="updateJob" :model="jobs" size="small" class="demo-table-expand" label-width="100px"
             label-position="left">
      <el-form-item
          prop="name"
          label="任务名称"
          :rules="{
          required: true,
          message: '任务名称不能为空',
          trigger: 'blur',
        }"
      >
        <el-input
            v-model="jobs.name"
            placeholder="请输入任务名称"
        ></el-input>
      </el-form-item>
      <el-form-item
          prop="suiteId"
          label="测试套件"
          :rules="{
          required: true,
          message: '测试套件不能为空',
          trigger: 'change',
        }"
      >
        <el-select
            style="width: 100%"
            v-model="jobs.suiteId"
            placeholder="请选择测试套件"
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
          label="Cron表达式"
          :rules="{
          required: true,
          message: 'Cron表达式不能为空',
          trigger: 'blur',
        }"
      >
        <el-input
            v-model="jobs.cronExpression"
            placeholder="请输入Cron表达式"
        ></el-input>
      </el-form-item>
    </el-form>
    <div style="text-align: center">
      <el-button size="small" type="primary" @click="summit">确 定</el-button>
    </div>
  </el-dialog>
  <el-button size="mini" round type="primary" @click="open">添加定时任务</el-button>
  <el-button size="small" type="text" @click="dialogCron = true"
  >什么是Cron表达式？
  </el-button
  >
  <el-dialog
      title="什么是Cron表达式？"
      v-model="dialogCron"
      width="720px"
      center
  >
    <p>* 第一位，表示秒，取值 0-59</p>
    <p>* 第二位，表示分，取值 0-59</p>
    <p>* 第三位，表示小时，取值 0-23</p>
    <p>* 第四位，日期，取值 1-31</p>
    <p>* 第五位，月份，取值 1-12</p>
    <p>* 第六位，星期几，取值 1-7</p>
    <p>* 第七位，年份，可以留空，取值 1970-2099</p>
    <p>(*) 星号：可以理解为“每”的意思，每秒、每分</p>
    <p>(?) 问好：只能出现在日期和星期这两个位置，表示这个位置的值不确定</p>
    <p>(-) 表达一个范围，如在小时字段中使用 10-12 ，表示从10点到12点</p>
    <p>
      (,) 逗号，表达一个列表值，如在星期字段中使用 1,2,4
      ，则表示星期一、星期二、星期四
    </p>
    <p>
      (/) 斜杠，如 x/y ，x是开始值，y是步长，如在第一位(秒)使用
      0/15，表示从0秒开始，每15秒
    </p>
    <p>官方解释：</p>
    <p>0 0 3 * * ? 每天 3 点执行</p>
    <p>0 5 3 * * ? 每天 3 点 5 分执行</p>
    <p>0 5 3 ? * * 每天 3 点 5 分执行</p>
    <p>
      0 5/10 3 * * ? 每天 3 点 5 分，15 分，25 分，35 分，45 分，55
      分这几个点执行
    </p>
    <p>0 10 3 ? * 1 每周星期天的 3 点10 分执行，注：1 表示星期天</p>
    <p>
      0 10 3 ? * 1#3 每个月的第三个星期的星期天 执行，#号只能出现在星期的位置
    </p>
    <p></p>
    <p>
      注：第六位(星期几)中的数字可能表达不太正确，可以使用英文缩写来表示，如：Sun
    </p>
  </el-dialog>
  <el-table
      :data="pageData['content']"
      style="width: 100%; margin-top: 20px"
      border
  >
    <el-table-column label="任务id" width="90" align="center" prop="id"></el-table-column>
    <el-table-column label="任务名称" width="240" align="center" prop="name"></el-table-column>
    <el-table-column label="测试套件" width="240" align="center" prop="suiteId">
      <template #default="scope">
        {{ getSuiteName(scope.row.suiteId) }}
      </template>
    </el-table-column>
    <el-table-column label="Cron表达式" header-align="center" prop="cronExpression"></el-table-column>
    <el-table-column label="状态" width="90" align="center">
      <template #default="scope">
        <el-switch
            v-model="scope.row.status"
            active-color="#13ce66"
            :active-value="1"
            :inactive-value="2"
            @change="
              updateStatus(
                scope.row.id,
                scope.row.status === 1 ? 1 :2
              )
            "
        >
        </el-switch>
      </template>
    </el-table-column>
    <el-table-column label="操作" width="250" align="center">
      <template #default="scope">
        <el-button
            type="success"
            size="mini"
            @click="updateStatus(
                scope.row.id,3
              )"
        >立即运行
        </el-button
        >
        <el-button
            type="primary"
            size="mini"
            @click="editJobs(scope.row.id)"
        >编辑
        </el-button
        >
        <el-popconfirm
            style="margin-left: 10px"
            :confirmButtonText="$t('form.confirm')"
            :cancelButtonText="$t('form.cancel')"
            @confirm="deleteJob(scope.row.id)"
            icon="el-icon-warning"
            iconColor="red"
            title="确定删除该定时任务吗？"
        >
          <template #reference>
            <el-button
                type="danger"
                size="mini"
            >删除
            </el-button
            >
          </template>
        </el-popconfirm>
      </template>
    </el-table-column>
  </el-table>
  <pageable :is-page-set="true" :total="pageData['totalElements']"
            :current-page="pageData['number']+1"
            :page-size="pageData['size']"
            @change="getJobsList"></pageable>
</template>