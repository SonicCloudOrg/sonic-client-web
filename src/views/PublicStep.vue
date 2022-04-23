<script setup>
import {onMounted, ref, watch} from "vue";
import {useRoute} from "vue-router";
import PublicStepUpdate from '../components/PublicStepUpdate.vue'
import Pageable from '../components/Pageable.vue'
import axios from "../http/axios";
import StepShow from '../components/StepShow.vue'
import {ElMessage} from "element-plus";

const route = useRoute()
const dialogVisible = ref(false)
const pageData = ref({});
const pageSize = ref(15);
const publicStepId = ref(0)
watch(dialogVisible, (newValue, oldValue) => {
  if (!newValue) {
    publicStepId.value = 0
  }
})
const editPublicStep = async (id) => {
  publicStepId.value = id
  await open()
}
const open = () => {
  dialogVisible.value = true
}
const flush = (e) => {
  if (e) {
    dialogVisible.value = false
  }
  getPublicStepList();
}
const getPublicStepList = (pageNum, pSize) => {
  axios.get("/controller/publicSteps/list", {
    params: {
      projectId: route.params.projectId,
      page: pageNum || 1,
      pageSize: pSize || pageSize.value,
    }
  }).then(resp => {
    pageData.value = resp.data
  })
}
const deletePublicStep = (id) => {
  axios.delete("/controller/publicSteps", {
    params: {
      id
    }
  }).then(resp => {
    if (resp['code'] === 2000) {
      ElMessage.success({
        message: resp['message'],
      });
      getPublicStepList()
    }
  })
}
onMounted(() => {
  getPublicStepList()
})
</script>
<template>
  <el-dialog v-model="dialogVisible" title="公共步骤信息" width="80%">
    <public-step-update v-if="dialogVisible" @flush="flush" :public-step-id="publicStepId"
                        :project-id="route.params.projectId"/>
  </el-dialog>
  <el-button size="mini" round type="primary" @click="open">添加公共步骤</el-button>
  <el-table :data="pageData['content']" border style="margin-top: 10px">
    <el-table-column width="100" label="公共步骤Id" prop="id" align="center"/>
    <el-table-column label="公共步骤名称" prop="name" header-align="center"/>
    <el-table-column label="平台" width="110" align="center">
      <template #default="scope">
        {{ scope.row.platform === 1 ? '安卓' : 'iOS' }}
      </template>
    </el-table-column>
    <el-table-column label="步骤列表" width="110" align="center">
      <template #default="scope">
        <el-popover
            placement="left"
            :width="500"
            trigger="click"
        >
          <el-table :data="scope.row.steps" border max-height="350">
            <el-table-column width="80" label="步骤Id" prop="id" align="center" show-overflow-tooltip/>
            <el-table-column width="90" label="所属用例" align="center">
              <template #default="scope">
                <el-tag size="mini" v-if="scope.row.caseId=== 0">无</el-tag>
                <span v-else>{{ scope.row.caseId }}</span>
              </template>
            </el-table-column>
            <el-table-column label="步骤详情" header-align="center">
              <template #default="scope">
                <step-show :step="scope.row"/>
              </template>
            </el-table-column>
          </el-table>
          <template #reference>
            <el-button size="mini">查看步骤</el-button>
          </template>
        </el-popover>
      </template>
    </el-table-column>
    <el-table-column label="操作" width="180" align="center">
      <template #default="scope">
        <el-button
            type="primary"
            size="mini"
            @click="editPublicStep(scope.row.id)"
        >
          编辑
        </el-button>
        <el-popconfirm
            style="margin-left: 10px"
            :confirmButtonText="$t('form.confirm')"
            :cancelButtonText="$t('form.cancel')"
            @confirm="deletePublicStep(scope.row.id)"
            icon="el-icon-warning"
            iconColor="red"
            title="确定删除该公共步骤吗？"
        >
          <template #reference>
            <el-button
                type="danger"
                size="mini"
            >
              删除
            </el-button>
          </template>
        </el-popconfirm>
      </template>
    </el-table-column>
  </el-table>
  <pageable :is-page-set="true" :total="pageData['totalElements']"
            :current-page="pageData['number']+1"
            :page-size="pageData['size']"
            @change="getPublicStepList"></pageable>
</template>