<script setup>
import axios from "../http/axios";
import {ref, defineProps, onMounted} from "vue";
import Pageable from './Pageable.vue'

const props = defineProps({
  projectId: Number,
  platform: Number
})
const pageData = ref({});
const pageSize = ref(10);
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
onMounted(() => {
  getTestCaseList();
})
</script>
<template>
  <el-table :data="pageData['content']" border>
    <el-table-column min-width="280" prop="name" header-align="center" show-overflow-tooltip>
      <template #header>
       <div class="flex-center"> <el-input v-model="name" size="mini" placeholder="输入用例名称搜索"/>
      <el-button size="mini" type="primary" style="margin-left: 10px">新增用例</el-button></div>
      </template>
    </el-table-column>
    <el-table-column min-width="80" label="模块名称" prop="module" align="center" show-overflow-tooltip/>
    <el-table-column min-width="80" label="版本名称" prop="module" align="center" show-overflow-tooltip/>
    <el-table-column min-width="80" label="设计人" prop="module" align="center" show-overflow-tooltip/>
    <el-table-column min-width="180" label="最后修改日期" prop="module" align="center"/>
    <el-table-column fixed="right" label="操作" align="center">
      <template #default="scope">
        <el-button type="primary" size="mini">关联</el-button>
      </template>
    </el-table-column>
  </el-table>
  <pageable
      :isPageSet="true"
      :total="pageData['totalElements']"
      :current-page="pageData['number']+1"
      :page-size="pageData['size']"
      @change="getTestCaseList"
  ></pageable>
</template>