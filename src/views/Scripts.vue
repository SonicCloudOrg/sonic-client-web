<script setup>
import Pageable from '../components/Pageable.vue'
import ScriptUpdate from '../components/ScriptUpdate.vue'
import {onMounted, ref, watch} from "vue";
import axios from "../http/axios";
import {useRoute} from "vue-router";
import {ElMessage} from "element-plus";

const route = useRoute()
const id = ref(0)
const pageData = ref({});
const pageSize = ref(15);
const name = ref("")
const dialogVisible = ref(false)
const open = () => {
  dialogVisible.value = true
}
watch(dialogVisible, (newValue, oldValue) => {
  if (!newValue) {
    id.value = 0
  }
})
const editScript = async (i) => {
  id.value = i
  await open()
}
const flush = () => {
  dialogVisible.value = false
  getScriptList();
}
const tableLoading = ref(false)
const getScriptList = (pageNum, pSize) => {
  tableLoading.value = true
  axios.get("/controller/scripts/list", {
    params: {
      projectId: route.params.projectId,
      name: name.value,
      page: pageNum || 1,
      pageSize: pSize || pageSize.value,
    }
  }).then(resp => {
    pageData.value = resp.data
    tableLoading.value = false
  })
}
const deleteScript = (id) => {
  axios.delete("/controller/scripts", {
    params: {
      id
    }
  }).then(resp => {
    if (resp['code'] === 2000) {
      ElMessage.success({
        message: resp['message'],
      });
      getScriptList()
    }
  })
}
onMounted(() => {
  getScriptList();
})
</script>

<template>
  <el-dialog v-model="dialogVisible" title="模板信息" width="1200px">
    <script-update v-if="dialogVisible"
                   :project-id="route.params.projectId"
                   :id="id" @flush="flush"/>
  </el-dialog>
  <el-button size="mini" round @click="open()" type="primary">新增模板</el-button>

  <el-table style="margin-top: 20px" border :data="pageData.content">
    <el-table-column align="center" width="80" property="id" label="脚本id"/>
    <el-table-column header-align="center" property="name">
      <template #header>
        <el-input v-model="name" size="mini" @input="getScriptList()" placeholder="输入名称搜索"/>
      </template>
    </el-table-column>
    <el-table-column align="center" width="100" property="scriptLanguage" label="脚本语言"/>
    <el-table-column align="center" width="150" label="操作">
      <template #default="scope">
        <el-button type="primary" size="mini" @click="editScript(scope.row.id)">编辑</el-button>
        <el-popconfirm
            style="margin-left: 10px"
            :confirmButtonText="$t('form.confirm')"
            :cancelButtonText="$t('form.cancel')"
            @confirm="deleteScript(scope.row.id)"
            icon="el-icon-warning"
            iconColor="red"
            title="确定删除该脚本模板吗？"
        >
          <template #reference>
            <el-button type="danger" size="mini">删除</el-button>
          </template>
        </el-popconfirm>
      </template>
    </el-table-column>
  </el-table>
  <pageable
      :isPageSet="true"
      :total="pageData['totalElements']"
      :current-page="pageData['number']+1"
      :page-size="pageData['size']"
      @change="getScriptList"
  ></pageable>

</template>