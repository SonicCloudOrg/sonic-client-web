<script setup>
import {onMounted, ref} from 'vue'
import Pageable from '../components/Pageable.vue'
import axios from "../http/axios";
import {useRoute, useRouter} from "vue-router";
import {ElMessage} from "element-plus";
import useClipboard from "vue-clipboard3";
import jenkins from "../assets/img/jenkins.png"
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

const getPackageList = (pageNum, pSize) => {
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
  getPackageList()
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
const getBuildId = (data) => {
  if (data && data != null && data.length > 0 && data.indexOf("/") >= 2) {
    return data.substring(data.substring(0, data.lastIndexOf("/")).lastIndexOf("/") + 1, data.length - 1)
  } else {
    return ""
  }
}
onMounted(() => {
  getPackageList()
})
</script>
<template>
  <a style="float: right;margin-bottom: 20px" href="https://sonic-cloud.gitee.io/#/SCH" target="_blank">
    <el-button size="mini" plain type="primary">接入指南</el-button></a>
  <el-table :data="pageData['content']" @filter-change="filter" border>
    <el-table-column width="80" label="Id" prop="id" align="center" show-overflow-tooltip/>
    <el-table-column width="110" label="构建链接" prop="buildUrl" align="center">
      <template #default="scope">
        <div style="display: flex;
    align-items: center;
    justify-content: center;">
          <el-image :src="jenkins" style="width: 28px"/>
          <el-link :href="scope.row.buildUrl" target="_blank" type="primary">
            <strong>#{{ getBuildId(scope.row.buildUrl) }}</strong>
          </el-link>
        </div>
      </template>
    </el-table-column>
    <el-table-column label="平台" width="120" prop="platform" align="center"
                     :filter-multiple="false" column-key="platform" :filters="[
        { text: 'Android', value: 'Android' },
        { text: 'iOS', value: 'iOS' },
      ]">
      <template #default="scope">
        <span v-if="scope.row.platform.length === 0">未指定</span>
        <span v-else>
              <el-tag size="small">{{ scope.row.platform.toUpperCase() }}</el-tag>
            </span>
      </template>
    </el-table-column>
    <el-table-column label="安装包名称" prop="pkgName" header-align="center" show-overflow-tooltip>
    </el-table-column>
    <el-table-column label="分支" width="280" prop="branch" align="center">
      <template #header>
        <el-input v-model="branch" size="mini" @input="getPackageList()" placeholder="输入分支名称"/>
      </template>
    </el-table-column>
    <el-table-column label="下载地址" width="180" prop="url" align="center">
      <template #default="scope">
        <el-button
            type="primary"
            size="mini"
            @click="copy(scope.row.url)"
        >复制url
        </el-button>
      </template>
    </el-table-column>
    <el-table-column
        label="创建时间"
        width="200"
        prop="createTime"
        align="center"
    >
    </el-table-column>
  </el-table>
  <pageable
      :isPageSet="true"
      :total="pageData['totalElements']"
      :current-page="pageData['number']+1"
      :page-size="pageData['size']"
      @change="getPackageList"
  ></pageable>
</template>