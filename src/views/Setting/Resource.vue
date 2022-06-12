<script setup>
import {onMounted, ref} from "vue";
import {useRoute} from "vue-router";
import axios from "@/http/axios";
import {ElMessage} from "element-plus";
import Pageable from '@/components/Pageable.vue'

const route = useRoute()

const pageData = ref({})
const pageSize = ref(15);
const path = ref("")

const updateStatus = (id, needAuth) => {
  axios.put("/controller/resources/edit", {
    id, needAuth
  }).then(resp => {
    if (resp['code'] === 2000) {
      ElMessage.success({
        message: resp['message'],
      });
    }
  })
}

const refresh = (id, needAuth) => {
  axios.post("/controller/resources/refresh", {
    id, needAuth
  }).then(resp => {
    if (resp['code'] === 2000) {
      pageData.value = resp.data
      ElMessage.success({
        message: "同步成功！",
      });
    }
  })
}

const getResourceList = (pageNum, pSize) => {
  axios.get("/controller/resources/list", {
    params: {
      page: pageNum || 1,
      pageSize: pSize || pageSize.value,
      path: path.value,
    }
  }).then(resp => {
    pageData.value = resp.data
  })
}

onMounted(() => {
  getResourceList()
})
</script>
<template>

  <el-button size="mini" style="margin-bottom: 10px" round type="primary" @click="refresh">同步资源</el-button>
  <el-alert style="margin-bottom: 10px" title="同步资源说明"
            description="重新全量更新应用内所有请求资源信息，一般版本更新需要同步"
            type="info" show-icon close-text="Get!"/>

  <el-table
      :data="pageData['content']"
      style="width: 100%; margin-top: 20px"
      border
  >
    <el-table-column label="资源id" width="90" align="center" prop="id"></el-table-column>
    <el-table-column label="描述" align="center" prop="desc"></el-table-column>
    <el-table-column label="路径" align="center" prop="path">
      <template #header>
        <el-input v-model="path" size="mini" @input="getResourceList(1)" placeholder="输入路径名称"/>
      </template>
    </el-table-column>
    <el-table-column label="调用方法" width="80" header-align="center" prop="method"></el-table-column>
    <el-table-column label="是否需要鉴权" width="120" align="center">
      <template #default="scope">
        <el-switch
            v-model="scope.row.needAuth"
            active-color="#13ce66"
            :active-value="1"
            :inactive-value="0"
            @change="
              updateStatus(
                scope.row.id,
                scope.row.status === 1 ? true :false
              )
            "
        >
        </el-switch>
      </template>
    </el-table-column>

  </el-table>
  <pageable :is-page-set="true" :total="pageData['totalElements']"
            :current-page="pageData['number']+1"
            :page-size="pageData['size']"
            @change="getResourceList"></pageable>
</template>