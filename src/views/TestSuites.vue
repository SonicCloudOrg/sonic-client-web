<script setup>
import {onMounted, ref, watch} from 'vue'
import axios from "../http/axios";
import {ElMessage} from "element-plus";
import TestSuiteUpdate from '../components/TestSuiteUpdate.vue'
import Pageable from '../components/Pageable.vue'
import {useRoute} from "vue-router";
const route = useRoute()
const pageData = ref({})
const pageSize = ref(15)
const dialogVisible = ref(false)
const name = ref("")
const currentPage = ref(0)
const suiteId = ref(0)
const loading = ref(false)
const open = () => {
  dialogVisible.value = true
}
const getTestSuiteList = (pageNum, pSize) => {
  axios.get("/controller/testSuites/list", {
    params: {
      projectId: route.params.projectId,
      name: name.value,
      page: pageNum || 1,
      pageSize: pSize || pageSize.value,
    }
  }).then(resp => {
    pageData.value = resp.data
  })
}
const deleteSuite = (id) => {
  axios.delete("/controller/testSuites", {
    params: {
      id
    }
  }).then(resp => {
    if (resp['code'] === 2000) {
      ElMessage.success({
        message: resp['message'],
      });
      getTestSuiteList();
    }
  })
}
const runSuite = (id) => {
  loading.value = true
  axios.get("/controller/testSuites/runSuite", {
    params: {
      id,
    }
  }).then(resp => {
    loading.value = false
    if (resp['code'] === 2000) {
      ElMessage.success({
        message: resp['message']+"测试已开始...",
      });
    }
  })
}
const editSuite = async (id) => {
  suiteId.value = id
  await open()
}
watch(dialogVisible, (newValue, oldValue) => {
  if (!newValue) {
    suiteId.value = 0
  }
})
const flush = () => {
  dialogVisible.value = false
  getTestSuiteList();
}
onMounted(() => {
  getTestSuiteList();
})
</script>
<template>
  <el-dialog v-model="dialogVisible" title="测试套件信息" width="950px">
    <test-suite-update v-if="dialogVisible" :suite-id="suiteId" @flush="flush"/>
  </el-dialog>
  <el-button size="mini" round type="primary" @click="open">添加测试套件</el-button>
  <el-table v-loading="loading" :data="pageData['content']" border style="margin-top: 15px">
    <el-table-column width="80" label="套件Id" prop="id" align="center" show-overflow-tooltip/>
    <el-table-column min-width="280" prop="name" header-align="center" show-overflow-tooltip>
      <template #header>
        <el-input v-model="name" size="mini" @input="getTestSuiteList(1)" placeholder="输入测试套件名称搜索"/>
      </template>
    </el-table-column>
    <el-table-column label="套件平台" min-width="110" align="center">
      <template #default="scope">
        {{ scope.row.platform === 1 ? '安卓' : 'iOS' }}
      </template>
    </el-table-column>
    <el-table-column label="覆盖类型" min-width="110" align="center">
      <template #default="scope">
        <el-tag size="small">{{ scope.row.cover === 1 ? '用例覆盖' : '设备覆盖' }}</el-tag>
      </template>
    </el-table-column>
    <el-table-column label="关联设备" width="130" align="center">
      <template #default="scope">
        <el-popover placement="left-start" width="400px">
          <el-table
              max-height="350"
              :data="scope.row['devices']"
              style="width: 100%; margin-top: 10px"
              border
          >
            <el-table-column
                label="设备id"
                width="90"
                prop="id"
                align="center"
            >
            </el-table-column>
            <el-table-column
                label="设备型号"
                prop="model"
                align="center"
            >
            </el-table-column>
            <el-table-column
                label="设备序列号"
                prop="udId"
                header-align="center"
                show-overflow-tooltip
            >
            </el-table-column>
          </el-table>
          <template #reference>
            <el-button size="mini"
            >查看列表
            </el-button
            >
          </template>
        </el-popover>
      </template>
    </el-table-column>
    <el-table-column label="关联用例" width="130" align="center">
      <template #default="scope">
        <el-popover placement="left-start" width="450px">
          <el-table
              max-height="350"
              :data="scope.row['testCases']"
              style="width: 100%; margin-top: 10px"
              border
          >
            <el-table-column
                label="用例id"
                width="90"
                prop="id"
                align="center"
            >
            </el-table-column>
            <el-table-column
                label="用例名称"
                prop="name"
                header-align="center"
                show-overflow-tooltip
            >
            </el-table-column>
            <el-table-column
                width="110"
                label="设计人"
                prop="designer"
                align="center"
                show-overflow-tooltip
            >
            </el-table-column>
          </el-table>
          <template #reference>
            <el-button size="mini"
            >查看列表
            </el-button
            >
          </template>
        </el-popover>
      </template>
    </el-table-column>
    <el-table-column width="250" fixed="right" label="操作" align="center">
      <template #default="scope">
        <el-button size="mini" type="success" @click="runSuite(scope.row.id)">运行</el-button>
        <el-button size="mini" type="primary" @click="editSuite(scope.row.id)">编辑</el-button>
        <el-popconfirm
            style="margin-left: 10px"
            :confirmButtonText="$t('form.confirm')"
            :cancelButtonText="$t('form.cancel')"
            @confirm="deleteSuite(scope.row.id)"
            icon="el-icon-warning"
            iconColor="red"
            title="确定删除该测试套件吗？套件下的用例将移出该套件"
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
      @change="getTestSuiteList"
  ></pageable>
</template>
