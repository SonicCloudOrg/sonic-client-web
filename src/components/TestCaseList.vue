<script setup>
import axios from "../http/axios";
import {ref, defineProps, onMounted} from "vue";
import Pageable from './Pageable.vue'

const props = defineProps({
  projectId: Number,
  platform: Number
})
const pageData = ref({});
const pageSize = ref(15);
const name = ref("")
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
  emit("selectCase", testCase)
}
onMounted(() => {
  getTestCaseList();
})
</script>
<template>
  <el-table :data="pageData['content']" border :row-style="{cursor:'pointer'}"
            @row-click="selectCase">
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