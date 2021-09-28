<script setup>
import {ref} from 'vue'

const pageData = ref({})
const dialogVisible = ref(false)
const name = ref("")
const getTestSuiteList = () => {

}
const deleteSuite = (id) => {

}
const editSuite = (id) => {

}
</script>
<template>
  <el-dialog v-model="dialogVisible" title="测试套件信息" width="600px">
    <!--    <test-case-update v-if="dialogVisible"-->
    <!--                      :project-id="projectId"-->
    <!--                      :case-id="caseId"-->
    <!--                      :platform="platform" @flush="flush"/>-->
  </el-dialog>
  <el-button size="mini" round type="primary">添加测试套件</el-button>
  <el-table :data="pageData['content']" border style="margin-top: 15px">
    <el-table-column width="80" label="套件Id" prop="id" align="center" show-overflow-tooltip/>
    <el-table-column min-width="280" prop="name" header-align="center" show-overflow-tooltip>
      <template #header>
        <el-input v-model="name" size="mini" @input="getTestSuiteList()" placeholder="输入测试套件名称搜索"/>
      </template>
    </el-table-column>
    <el-table-column label="套件平台" min-width="110" align="center">
      <template #default="scope">
        {{ scope.row.platform }}
      </template>
    </el-table-column>
    <el-table-column
        label="模块并发线程"
        min-width="110"
        align="center"
        prop="moduleThread"
    >
    </el-table-column>

    <el-table-column
        label="用例并发线程"
        min-width="110"
        align="center"
        prop="caseThread"
    >
    </el-table-column>

    <el-table-column
        label="设备并发线程"
        min-width="110"
        align="center"
        prop="deviceThread"
    >
    </el-table-column>
    <el-table-column label="关联设备" width="130" align="center">
      <template #default="scope">
        <el-popover placement="left-top" width="400">
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
                label="设备名称"
                prop="name"
                header-align="center"
            >
            </el-table-column>
            <el-table-column
                label="设备型号"
                prop="name"
                header-align="center"
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
        <el-popover placement="left-top" width="400">
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
        <el-button size="mini" type="success">运行</el-button>
        <el-button size="mini" type="primary" @click="editSuite(scope.row.id)">编辑</el-button>
        <el-popconfirm
            style="margin-left: 10px"
            confirmButtonText="确认"
            cancelButtonText="取消"
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