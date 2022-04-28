<script setup>
import {onMounted, ref} from "vue";
import {useRoute} from "vue-router";
import axios from "../http/axios";
import {ElMessage} from "element-plus";

const route = useRoute()
const dialogVisible = ref(false)
const pageData = ref([])
const updateGlobal = ref(null)
const globalParams = ref({
  id: null,
  projectId: route.params.projectId,
  paramsKey: "",
  paramsValue: ""
})
const editGlobalParams = async (id) => {
  await open()
  await getGlobalInfo(id)
}
const open = () => {
  globalParams.value = {
    id: null,
    projectId: route.params.projectId,
    paramsKey: "",
    paramsValue: ""
  }
  dialogVisible.value = true
}
const getGlobalParamsList = () => {
  axios.get("/controller/globalParams/list", {
    params: {
      projectId: route.params.projectId,
    }
  }).then(resp => {
    pageData.value = resp.data
  })
}
const getGlobalInfo = (id) => {
  axios.get("/controller/globalParams", {
    params: {
      id
    }
  }).then(resp => {
    globalParams.value = resp.data
  })
}
const deleteGlobal = (id) => {
  axios.delete("/controller/globalParams", {
    params: {
      id
    }
  }).then(resp => {
    if (resp['code'] === 2000) {
      ElMessage.success({
        message: resp['message'],
      });
      getGlobalParamsList();
    }
  })
}
const summit = () => {
  updateGlobal['value'].validate((valid) => {
    if (valid) {
      axios.put("/controller/globalParams", globalParams.value).then(resp => {
        if (resp['code'] === 2000) {
          ElMessage.success({
            message: resp['message'],
          });
          dialogVisible.value = false
          getGlobalParamsList();
        }
      })
    }
  })
}
onMounted(() => {
  getGlobalParamsList();
})
</script>
<template>
  <el-dialog v-model="dialogVisible" title="全局参数信息" width="600px">
    <el-alert style="margin-bottom: 10px" title="特殊使用"
              description="如有多个参数值可以用 | 号隔开，分配设备时会随机分配，单次任务内参数值只会取同一个。【random】和【timestamp】参数已内置，可用作构造随机数据"
              type="info" show-icon close-text="Get!"/>
    <el-form ref="updateGlobal" :model="globalParams" size="small" class="demo-table-expand" label-width="90px"
             label-position="left">
      <el-form-item
          prop="paramsKey"
          label="参数名"
          :rules="{
          required: true,
          message: '参数名不能为空，建议使用英文',
          trigger: 'blur',
        }"
      >
        <el-input
            v-model="globalParams.paramsKey"
            placeholder="请输入参数名"
        ></el-input>
      </el-form-item>
      <el-form-item
          prop="paramsValue"
          label="参数值"
          :rules="{
          required: true,
          message: '参数值不能为空，多个可以用 | 号隔开',
          trigger: 'blur',
        }"
      >
        <el-input
            v-model="globalParams.paramsValue"
            placeholder="请输入参数值，多个可以用 | 号隔开"
        ></el-input>
      </el-form-item>
    </el-form>
    <div style="text-align: center">
      <el-button size="small" type="primary" @click="summit">确 定</el-button>
    </div>
  </el-dialog>
  <el-button size="mini" round type="primary" @click="open">添加全局参数</el-button>
  <el-table
      :data="pageData"
      style="width: 100%; margin-top: 20px"
      border
  >
    <el-table-column label="参数id" width="90" align="center" prop="id"></el-table-column>
    <el-table-column label="参数名" width="240" align="center" prop="paramsKey"></el-table-column>
    <el-table-column label="参数值" header-align="center" prop="paramsValue"></el-table-column>
    <el-table-column label="操作" width="170" align="center">
      <template #default="scope">
        <el-button
            type="primary"
            size="mini"
            @click="editGlobalParams(scope.row.id)"
        >编辑
        </el-button
        >
        <el-popconfirm
            style="margin-left: 10px"
            :confirmButtonText="$t('form.confirm')"
            :cancelButtonText="$t('form.cancel')"
            @confirm="deleteGlobal(scope.row.id)"
            icon="el-icon-warning"
            iconColor="red"
            title="确定删除该全局参数吗？"
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
</template>