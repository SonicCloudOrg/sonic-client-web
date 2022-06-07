<script setup>
import axios from "../http/axios";
import {ref, onMounted, watch} from "vue";
import Pageable from './Pageable.vue'
import TestCaseUpdate from './TestCaseUpdate.vue'
import {ElMessage} from "element-plus";
import {useRouter} from "vue-router";

const props = defineProps({
  projectId: Number,
  platform: Number,
  isReadOnly: Boolean
})
const router = useRouter()
const pageData = ref({});
const pageSize = ref(15);
const name = ref("")
const caseId = ref(0)
const dialogVisible = ref(false)
const tableLoading = ref(false)
const getTestCaseList = (pageNum, pSize) => {
  tableLoading.value = true
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
    tableLoading.value = false
  })
}
const deleteCase = (id) => {
  axios.delete("/controller/testCases", {
    params: {
      id
    }
  }).then(resp => {
    if (resp['code'] === 2000) {
      ElMessage.success({
        message: resp['message'],
      });
      getTestCaseList()
    }
  })
}
const copy = (id) => {
  axios.get("/controller/testCases/copy", {
    params: {
      id
    }
  }).then(resp => {
    if (resp['code'] === 2000){
      ElMessage.success({
        message: resp['message'],
      });
      getTestCaseList()
    }
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
watch(dialogVisible, (newValue, oldValue) => {
  if (!newValue) {
    caseId.value = 0
  }
})
watch(
    () => props.projectId,
    () => {
      getTestCaseList();
    })
const editCase = async (id) => {
  caseId.value = id
  await open()
}
const flush = () => {
  dialogVisible.value = false
  getTestCaseList();
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
                      :case-id="caseId"
                      :platform="platform" @flush="flush"/>
  </el-dialog>
  <el-table v-loading="tableLoading" :data="pageData['content']" border :row-style="isReadOnly?{cursor:'pointer'}:{}"
            @row-click="selectCase" style="margin-top: 15px">
    <el-table-column width="80" label="用例Id" prop="id" align="center" show-overflow-tooltip/>
    <el-table-column min-width="280" prop="name" header-align="center" show-overflow-tooltip>
      <template #header>
        <el-input v-model="name" size="mini" @input="getTestCaseList()" placeholder="输入用例名称搜索"/>
      </template>
    </el-table-column>
    <el-table-column min-width="80" label="模块名称" prop="module" align="center">
      <template #default="scope">
        <el-tag size="small" v-if="scope.row.module.length > 0">{{ scope.row.module }}</el-tag>
        <span v-else>未填写</span>
      </template>
    </el-table-column>
    <el-table-column min-width="80" label="版本名称" prop="version" align="center">
      <template #default="scope">
        <el-tag type="info" size="small" v-if="scope.row.version.length > 0">{{ scope.row.version }}</el-tag>
        <span v-else>未填写</span>
      </template>
    </el-table-column>
    <el-table-column min-width="80" label="设计人" prop="designer" align="center" show-overflow-tooltip/>
    <el-table-column min-width="180" label="最后修改日期" prop="editTime" align="center"/>
    <el-table-column width="300" fixed="right" label="操作" align="center" v-if="!isReadOnly">
      <template #default="scope">
        <el-button size="mini" @click="router.push('StepListView/'+scope.row.id)">步骤详情</el-button>
        <el-button size="mini" type="primary" @click="editCase(scope.row.id)">编辑</el-button>
<!--        <el-button size="mini" type="primary" plain @click="copy(scope.row.id) ">复制</el-button>-->
        <el-popconfirm
            style="margin-left: 10px"
            :confirmButtonText="$t('form.confirm')"
            :cancelButtonText="$t('form.cancel')"
            @confirm="deleteCase(scope.row.id)"
            icon="el-icon-warning"
            iconColor="red"
            title="确定删除该用例吗？用例下的步骤将移出该用例"
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
      @change="getTestCaseList"
  ></pageable>
</template>