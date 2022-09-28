<script setup>
import {onMounted, ref} from 'vue'
import Pageable from '../components/Pageable.vue'
import axios from "../http/axios";
import {useRoute, useRouter} from "vue-router";
import {ElMessage} from "element-plus";
import {useI18n} from 'vue-i18n'
const {t: $t} = useI18n()

const route = useRoute()
const router = useRouter()
const pageData = ref({})
const pageSize = ref(15)
const currentPage = ref(0)
const getResultList = (pageNum, pSize) => {
  axios.get("/controller/results/list", {
    params: {
      projectId: route.params.projectId,
      page: pageNum || 1,
      pageSize: pSize || pageSize.value,
    }
  }).then(resp => {
    pageData.value = resp.data
  })
}
const delResult = (id) => {
  axios.delete("/controller/results", {
    params: {
      id
    }
  }).then(resp => {
    if (resp['code'] === 2000) {
      ElMessage.success({
        message: resp['message'],
      });
      getResultList();
    }
  })
}
const forceStopSuite = (id) => {
  axios.get("/controller/testSuites/forceStopSuite", {
    params: {
      resultId: id
    }
  }).then(resp => {
    if (resp['code'] === 2000) {
      ElMessage.success({
        message: resp['message'],
      });
      getResultList();
    }
  })
}
onMounted(() => {
  getResultList()
})
</script>
<template>
  <el-table :data="pageData['content']" border>
    <el-table-column width="80" :label="$t('resultDetailTS.page.resultId')" prop="id" align="center" show-overflow-tooltip/>
    <el-table-column :label="$t('ResultsTS.name')" min-width="280" prop="suiteName" header-align="center" show-overflow-tooltip>
    </el-table-column>
    <el-table-column :label="$t('resultDetailTS.page.executeUser')" width="120" align="center">
      <template #default="scope">
        <el-tag size="small" v-if="scope.row.strike === 'SYSTEM'"
        >{{ $t('routes.timedTask') }}
        </el-tag
        >
        <span v-else>{{ scope.row.strike }}</span>
      </template>
    </el-table-column>
    <el-table-column :label="$t('resultDetailTS.page.runStatus')" width="120" align="center">
      <template #default="scope">
        <el-tag type="success" size="small" v-if="scope.row.status === 1"
        >{{$t('resultDetailTS.page.testPass')}}
        </el-tag
        >
        <el-tag type="info" size="small" v-if="scope.row.status === 0"
        ><i class="el-icon-loading"></i> {{ $t('resultDetailTS.runIng') }}
        </el-tag
        >
        <el-tag type="danger" size="small" v-if="scope.row.status === 3"
        >{{$t('resultDetailTS.page.testFail')}}
        </el-tag
        >
        <el-tag type="warning" size="small" v-if="scope.row.status === 2"
        >{{$t('resultDetailTS.page.testAlert')}}
        </el-tag
        >
      </template>
    </el-table-column>
    <el-table-column
        :label="$t('packagesTS.creatTime')"
        width="200"
        prop="createTime"
        align="center"
    >
    </el-table-column>
    <el-table-column fixed="right" :label="$t('ResultsTS.testReport')" width="160" align="center">
      <template #default="scope">
        <div style="text-align: center">
          <el-button
              size="mini"
              icon="el-icon-tickets"
              @click="router.push('ResultDetail/'+scope.row.id)"
          >{{$t('ResultsTS.lookReport')}}
          </el-button
          >
        </div>
      </template>
    </el-table-column>
    <el-table-column fixed="right" :label="$t('common.operate')" width="220" align="center">
      <template #default="scope">
        <el-popconfirm
            style="margin-left: 10px"
            :confirmButtonText="$t('form.confirm')"
            :cancelButtonText="$t('form.cancel')"
            @confirm="forceStopSuite(scope.row.id)"
            icon="el-icon-warning"
            iconColor="red"
            :title="$t('ResultsTS.interruptTest')"
        >
          <template #reference>
            <el-button
                :disabled="scope.row.status !== 0"
                type="warning"
                size="mini"
                icon="el-icon-video-pause"
            >{{ $t('ResultsTS.interrupt') }}
            </el-button
            >
          </template>
        </el-popconfirm>
        <el-popconfirm
            style="margin-left: 10px"
            :confirmButtonText="$t('form.confirm')"
            :cancelButtonText="$t('form.cancel')"
            @confirm="delResult(scope.row.id)"
            icon="el-icon-warning"
            iconColor="red"
            :title="$t('ResultsTS.del')"
        >
          <template #reference>
            <el-button
                type="danger"
                size="mini"
                icon="el-icon-delete"
            >{{ $t('common.delete') }}
            </el-button
            >
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
      @change="getResultList"
  ></pageable>
</template>
