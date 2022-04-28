<script setup>
import {onMounted, ref} from "vue";
import {useRoute} from "vue-router";
import axios from "../http/axios";
import {ElMessage} from "element-plus";

const route = useRoute()
const dialogVisible = ref(false)
const pageData = ref([])
const updateModule = ref(null)
const modules = ref({
  id: null,
  projectId: route.params.projectId,
  name: ""
})
const editModule = async (id) => {
  await open()
  await getModuleInfo(id)
}
const open = () => {
  modules.value = {
    id: null,
    projectId: route.params.projectId,
    name: ""
  }
  dialogVisible.value = true
}
const getModuleList = () => {
  axios.get("/controller/modules/list", {
    params: {
      projectId: route.params.projectId,
    }
  }).then(resp => {
    pageData.value = resp.data
  })
}
const getModuleInfo = (id) => {
  axios.get("/controller/modules", {
    params: {
      id
    }
  }).then(resp => {
    modules.value = resp.data
  })
}
const deleteModule = (id) => {
  axios.delete("/controller/modules", {
    params: {
      id
    }
  }).then(resp => {
    if (resp['code'] === 2000) {
      ElMessage.success({
        message: resp['message'],
      });
      getModuleList();
    }
  })
}
const summit = () => {
  updateModule['value'].validate((valid) => {
    if (valid) {
      axios.put("/controller/modules", modules.value).then(resp => {
        if (resp['code'] === 2000) {
          ElMessage.success({
            message: resp['message'],
          });
          dialogVisible.value = false
          getModuleList();
        }
      })
    }
  })
}
onMounted(() => {
  getModuleList();
})
</script>
<template>
  <el-dialog v-model="dialogVisible" title="模块信息" width="400px">
    <el-form ref="updateModule" :model="modules" size="small" class="demo-table-expand" label-width="90px"
             label-position="left">
      <el-form-item
          prop="name"
          label="模块名称"
          :rules="{
          required: true,
          message: '模块名称不能为空',
          trigger: 'blur',
        }"
      >
        <el-input
            v-model="modules.name"
            placeholder="请输入模块名称"
        ></el-input>
      </el-form-item>
    </el-form>
    <div style="text-align: center">
      <el-button size="small" type="primary" @click="summit">确 定</el-button>
    </div>
  </el-dialog>
  <el-button size="mini" round type="primary" @click="open">添加模块</el-button>
  <el-row :gutter="20">
    <el-col :span="6" v-for="m in pageData" style="margin-top: 20px">
      <el-card>
        <div style="text-align: center;font-size:14px;color:#606266"> {{ m.name }}</div>
        <el-divider style="margin: 12px 0;"></el-divider>
        <div style="text-align: center">
          <el-button
              type="primary"
              size="mini"
              @click="editModule(m.id)"
          >编辑
          </el-button
          >
          <el-popconfirm
              style="margin-left: 10px"
              :confirmButtonText="$t('form.confirm')"
              :cancelButtonText="$t('form.cancel')"
              @confirm="deleteModule(m.id)"
              icon="el-icon-warning"
              iconColor="red"
              title="确定删除该模块吗？"
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
    </el-col>
  </el-row>
</template>