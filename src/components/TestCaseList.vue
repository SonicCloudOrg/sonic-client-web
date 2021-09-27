<script setup>
import axios from "../http/axios";
import {ref, onMounted} from "vue";
import Pageable from './Pageable.vue'
import TestCaseUpdate from './TestCaseUpdate.vue'

const props = defineProps({
  projectId: Number,
  platform: Number,
  isReadOnly: Boolean
})
const pageData = ref({});
const pageSize = ref(15);
const name = ref("")
const dialogVisible = ref(false)
const getTestCaseList = (pageNum, pSize) => {
  axios.get("/controller/testCases/list", {
    params: {
      projectId: props.projectId,
      platform: props.platform,
      name: name.value,
      page: pageNum || 1,
      pageSize: pSize || pageSize.value,
    }
  }).then(resp => {
    pageData.value = resp.data
  })
}
const emit = defineEmits(['selectCase'])
const selectCase = (testCase, c, e) => {
  if (props.isReadOnly) {
    emit("selectCase", testCase)
  }
}
const open = () => {
  dialogVisible.value = true
}
onMounted(() => {
  getTestCaseList();
})
defineExpose({open})
</script>
<template>
  <el-dialog v-model="dialogVisible" title="用例信息" width="600px">
    <test-case-update v-if="dialogVisible"
                      :project-id="projectId"
                      :platform="1"/>
  </el-dialog>
  <el-table :data="pageData['content']" border :row-style="isReadOnly?{cursor:'pointer'}:{}"
            @row-click="selectCase" style="margin-top: 15px">
    <el-table-column width="80" label="用例Id" prop="id" align="center" show-overflow-tooltip/>
    <el-table-column min-width="280" prop="name" header-align="center" show-overflow-tooltip>
      <template #header>
        <el-input v-model="name" size="mini" @input="getTestCaseList()" placeholder="输入用例名称搜索"/>
      </template>
    </el-table-column>
    <el-table-column min-width="80" label="模块名称" prop="module" align="center" show-overflow-tooltip/>
    <el-table-column min-width="80" label="版本名称" prop="version" align="center" show-overflow-tooltip/>
    <el-table-column min-width="80" label="设计人" prop="designer" align="center" show-overflow-tooltip/>
    <el-table-column min-width="180" label="最后修改日期" prop="editTime" align="center"/>
  </el-table>
  <pageable
      :isPageSet="true"
      :total="pageData['totalElements']"
      :current-page="pageData['number']+1"
      :page-size="pageData['size']"
      @change="getTestCaseList"
  ></pageable>
</template>