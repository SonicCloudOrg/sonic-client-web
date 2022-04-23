<script setup>
import {onMounted, ref} from "vue";
import {useRoute} from "vue-router";
import axios from "../http/axios";
import {ElMessage} from "element-plus";

const route = useRoute()
const dialogVisible = ref(false)
const pageData = ref([])
const updateVersion = ref(null)
const versions = ref({
  id: null,
  projectId: route.params.projectId,
  versionName: "",
  createTime: ""
})
const editVersion = async (id) => {
  await open()
  await getVersionInfo(id)
}
const open = () => {
  versions.value = {
    id: null,
    projectId: route.params.projectId,
    versionName: "",
    createTime: ""
  }
  dialogVisible.value = true
}
const getVersionList = () => {
  axios.get("/controller/versions/list", {
    params: {
      projectId: route.params.projectId,
    }
  }).then(resp => {
    pageData.value = resp.data
  })
}
const getVersionInfo = (id) => {
  axios.get("/controller/versions", {
    params: {
      id
    }
  }).then(resp => {
    versions.value = resp.data
  })
}
const deleteVersion = (id) => {
  axios.delete("/controller/versions", {
    params: {
      id
    }
  }).then(resp => {
    if (resp['code'] === 2000) {
      ElMessage.success({
        message: resp['message'],
      });
      getVersionList();
    }
  })
}
const summit = () => {
  updateVersion['value'].validate((valid) => {
    if (valid) {
      axios.put("/controller/versions", versions.value).then(resp => {
        if (resp['code'] === 2000) {
          ElMessage.success({
            message: resp['message'],
          });
          dialogVisible.value = false
          getVersionList();
        }
      })
    }
  })
}
onMounted(() => {
  getVersionList();
})
</script>
<template>
  <el-dialog v-model="dialogVisible" title="版本迭代信息" width="400px">
    <el-form ref="updateVersion" :model="versions" size="small" class="demo-table-expand" label-width="90px"
             label-position="left">
      <el-form-item
          prop="versionName"
          label="版本名称"
          :rules="{
          required: true,
          message: '版本名称不能为空',
          trigger: 'blur',
        }"
      >
        <el-input
            v-model="versions.versionName"
            placeholder="请输入版本名称"
        ></el-input>
      </el-form-item>
      <el-form-item label="时间" prop="createTime" :rules="{
          required: true,
          message: '时间不能为空',
          trigger: 'change',
        }">
        <el-date-picker
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
            v-model="versions.createTime"
            type="datetime"
            placeholder="选择日期时间"
        ></el-date-picker>
      </el-form-item>
    </el-form>
    <div style="text-align: center">
      <el-button size="small" type="primary" @click="summit">确 定</el-button>
    </div>
  </el-dialog>
  <el-button size="mini" round type="primary" @click="open">添加版本迭代</el-button>
  <el-timeline style="margin-top: 20px">
    <el-timeline-item :hollow="true" :type="index===0?'success':'info'" v-for="(v,index) in pageData"
                      :timestamp="v.createTime" placement="top">
      <el-card>
        <h3 style="margin-top: 5px">{{ v.versionName }}</h3>
        <div>
          <el-button
              type="primary"
              size="mini"
              @click="editVersion(v.id)"
          >编辑
          </el-button
          >
          <el-popconfirm
              style="margin-left: 10px"
              :confirmButtonText="$t('form.confirm')"
              :cancelButtonText="$t('form.cancel')"
              @confirm="deleteVersion(v.id)"
              icon="el-icon-warning"
              iconColor="red"
              title="确定删除该版本吗？"
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
        </div>
      </el-card>
    </el-timeline-item>
  </el-timeline>
</template>