<script setup>
import {onMounted, ref} from 'vue'
import Pageable from '../components/Pageable.vue'
import axios from "../http/axios";
import {useRoute, useRouter} from "vue-router";
import {ElMessage} from "element-plus";
import useClipboard from "vue-clipboard3";
import {useI18n} from 'vue-i18n'
const {t: $t} = useI18n()

const {toClipboard} = useClipboard();

const route = useRoute()
const router = useRouter()
const pageData = ref({})
const pageSize = ref(15)
const currentPage = ref(0)
const platform = ref("")
const branch = ref("")

const PackageList = (pageNum, pSize) => {
  axios.get("/controller/packages/list", {
    params: {
      projectId: route.params.projectId,
      page: pageNum || 1,
      platform: platform.value,
      branch: branch.value,
      pageSize: pSize || pageSize.value,
    }
  }).then(resp => {
    pageData.value = resp.data
  })
}

const filter = (e) => {
  platform.value = e.platform[0]
  PackageList()
}

const copy = (value) => {
  try {
    toClipboard(value);
    ElMessage.success({
      message: $t('dialog.copy.success'),
    });
  } catch (e) {
    ElMessage.error({
      message: $t('dialog.copy.fail'),
    });
  }
}

onMounted(() => {
  PackageList()
})
</script>
<template>
  <el-table :data="pageData['content']" @filter-change="filter" border>
    <el-table-column width="80" label="Id" prop="id" align="center" show-overflow-tooltip/>
    <el-table-column label="安装包名称" width="120" prop="pkgName" header-align="center" show-overflow-tooltip>
    </el-table-column>
    <el-table-column label="平台" width="120" prop="platform" align="center" 
    :filter-multiple="false" column-key="platform" :filters="[
        { text: 'Android', value: 'Android' },
        { text: 'iOS', value: 'iOS' },
      ]">
      <template #default="scope">
        <span v-if="scope.row.platform.length === 0">未指定</span>
        <span v-else>
              <el-tag size="medium" >{{ scope.row.platform }}</el-tag>
            </span>
      </template>
    </el-table-column>
    <el-table-column label="分支" width="180" prop="branch" align="center">
      <template #header>
        <el-input v-model="branch" size="mini" @input="PackageList()" placeholder="输入分支名称"/>
      </template>
    </el-table-column>
    <el-table-column label="下载地址"  prop="url"  align="center">
    </el-table-column>
    <el-table-column
        label="创建时间"
        width="200"
        prop="createTime"
        align="center"
    >
    </el-table-column>
    <el-table-column fixed="right" label="操作" width="220" align="center">
      <template #default="scope">
        <el-button
                type="primary"
                size="mini"
                @click="copy(scope.row.url)"
            >复制url
            </el-button>
      </template>
    </el-table-column>
  </el-table>
  <pageable
      :isPageSet="true"
      :total="pageData['totalElements']"
      :current-page="pageData['number']+1"
      :page-size="pageData['size']"
      @change="getResultList"
  ></pageable>
</template>