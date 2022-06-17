<script setup>
import {onMounted, ref} from "vue";
import axios from "@/http/axios";
import {ElMessage} from "element-plus";

const sysLogs = ref([])

const dialogVisible = ref(false)

const findSysJobs = () => {
  axios.get("/controller/jobs/findSysJobs").then(resp => {
    sysLogs.value = resp.data
  })
}

const open = (type, cron) => {
  edit.value = {type, cron}
  dialogVisible.value = true
}

const edit = ref({
  type: "",
  cron: ""
})

const updateSysJob = () => {
  axios.put("/controller/jobs/updateSysJob",edit.value).then(resp => {
    if (resp['code'] === 2000) {
      dialogVisible.value = false
      ElMessage.success({
        message: resp['message'],
      });
      findSysJobs()
    }
  })
}

const getInfo = (type) => {
  let result = {
    name: "",
    des: ""
  }
  switch (type) {
    case "cleanFile":
      result = {
        name: "清理系统文件",
        des: "清理测试过程产生的图片、录像或远控期间临时apk包等等文件，保留天数为 [前两次定时任务到本次定时任务间隔] 天数。"
      }
      break
    case "cleanResult":
      result = {
        name: "清理测试报告",
        des: "清理测试报告，保留天数为 [前两次定时任务到本次定时任务间隔] 天数。"
      }
      break
    case "sendDayReport":
      result = {
        name: "发送日报",
        des: "发送测试日报到群机器人。"
      }
      break
    case "sendWeekReport":
      result = {
        name: "发送周报",
        des: "发送测试周报到群机器人。"
      }
      break
  }
  return result
}

onMounted(() => {
  findSysJobs()
})
</script>
<template>
  <el-table
      :data="sysLogs"
      style="width: 100%;"
      border
  >
    <el-table-column label="类型" width="190" align="center" prop="type">
      <template #default="scope">
        {{ getInfo(scope.row.type).name }}
      </template>
    </el-table-column>
    <el-table-column label="描述" show-overflow-tooltip header-align="center" prop="type">
      <template #default="scope">
        {{ getInfo(scope.row.type).des }}
      </template>
    </el-table-column>
    <el-table-column label="定时任务" width="250" align="center" prop="cron"></el-table-column>
    <el-table-column label="下次触发日期" width="450" align="center" prop="cronNext">
      <template #default="scope">
        {{ new Date(scope.row['cronNext']) }}
      </template>
    </el-table-column>
    <el-table-column label="操作" width="150" align="center">
      <template #default="scope">
        <el-button size="mini" type="primary" @click="open(scope.row.type,scope.row.cron)">编辑</el-button>
      </template>
    </el-table-column>
  </el-table>

  <el-dialog v-model="dialogVisible" title="编辑系统定时任务" width="600px">
    <el-form ref="updateRoles" :model="edit" size="small" class="demo-table-expand" label-width="90px"
             label-position="left">
      <el-form-item
          label="cron表达式"
      >
        <el-input
            v-model="edit.cron"
        ></el-input>
      </el-form-item>
    </el-form>
    <div style="text-align: center">
      <el-button size="small" type="primary" @click="updateSysJob">确 定</el-button>
    </div>
  </el-dialog>
</template>