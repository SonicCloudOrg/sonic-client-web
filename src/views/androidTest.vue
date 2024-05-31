<script setup>
import {onMounted, ref} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {ElMessage} from 'element-plus';
import {useI18n} from 'vue-i18n';
import axios from '../http/axios';
import Pageable from '../components/Pageable.vue';
import mockData from '../locales/android.json';

const {t: $t} = useI18n();

const route = useRoute();
const router = useRouter();
const pageData = ref({});
const pageSize = ref(15);
const pageCurrNum = ref(1);
const platformOptions = ref([ // 定义平台选项数组
  {label: 'Android', value: '1'},
  {label: 'iOS', value: '2'}
]);
const selectedPlatform = ref('1');// 定义选择版本
const appVersion = ref([]);// 定义appversion数据
const selectedAppVersion = ref('');// 定义选择appVersion
const resultId = ref('');
const caseId = ref('');
const udid = ref('');

const getAndroidList = (pageNum, pSize) => {
  console.log(pSize)
  pageSize.value = pSize || pageSize.value;
  pageCurrNum.value = pageNum || pageCurrNum.value;
  axios
      .get('/controller/resultPerformance/list', {
        // 定义传递给接口的参数，首次进来platform默认为1
        params: {
          projectId: route.params.projectId,
          page: pageCurrNum.value,
          pageSize: pageSize.value,
          platform: selectedPlatform.value,
        },
      })
      .then((resp) => {
        pageData.value = resp.data;
        const arr1 = pageData.value.content
        console.log(arr1)
        const arr = Array.from(new Set(arr1.map(item => item.appVersion))).map(app => {
              return arr1.find(item => item.appVersion === app)
            }
        )
        appVersion.value = arr
        console.log('123', appVersion.value)
        ElMessage.success({
          message: resp.message,
        });
      });
};

const getPplatform = (pageNum, pSize) => {
  // console.log('222',selectedPlatform.value)
  pageSize.value = pSize || pageSize.value;
  pageCurrNum.value = pageNum || pageCurrNum.value;
  axios
      .get('/controller/resultPerformance/list', {
        // 参数是使用v-model绑定的，所以不需要传递，直接拿板顶数据的.value就行，例如selectedAppVersion.value，下面数据也是如此，两个下拉选择框写了两个方法
        params: {
          projectId: route.params.projectId,
          page: pageCurrNum.value,
          pageSize: pageSize.value,
          platform: selectedPlatform.value,
        },
      })
      .then((resp) => {
        // console.log('222',selectedPlatform)
        pageData.value = resp.data;
        ElMessage.success({
          message: resp.message,
        });
      });
}
const getAppVersion = (pageNum, pSize) => {
  pageSize.value = pSize || pageSize.value;
  pageCurrNum.value = pageNum || pageCurrNum.value;
  axios
      .get('/controller/resultPerformance/list', {
        params: {
          projectId: route.params.projectId,
          page: pageCurrNum.value,
          pageSize: pageSize.value,
          appVersion: `${selectedAppVersion.value}`,
          platform: selectedPlatform.value,
        },
      })
      .then((resp) => {
        console.log('222', resp)
        pageData.value = resp.data;
        ElMessage.success({
          message: resp.message,
        });
      });
};
const resultIdS = (pageNum, pSize) => {
  pageSize.value = pSize || pageSize.value;
  pageCurrNum.value = pageNum || pageCurrNum.value;
  console.log('123', resultId.value)
  axios
      .get('/controller/resultPerformance/list', {
        // 输入框的方法集合在一个方法里面，不是必须的参数给一个判断为‘’，需要查询的数据也是双向绑定的，
        params: {
          resultId: resultId.value,
          projectId: route.params.projectId,
          page: pageCurrNum.value,
          pageSize: pageSize.value,
          platform: selectedPlatform.value,
          udid: udid.value || '',
          caseId: caseId.value || '',
        },
      })
      .then((resp) => {
        if (resp.code === 2000) {
          ElMessage.success({
            message: resp.message,
          });
          // getAndroidList();
        }
      });
};
onMounted(() => {
  getAndroidList(1, 10);
});
</script>

<template>
  <!-- 添加搜索框 -->
  <div style="margin-bottom: 15px;display: flex">
    <!--  v-model双向绑定数据，placeholder默认字样，@change是监听数据变化  -->
    <el-select
        v-model="selectedPlatform"
        size="mini"
        style="width: 240px"
        :placeholder="$t('performance.platform')"
        @change="getPplatform(1)"
    >
      <!--  上面接定义的数组数据，循环给下拉框 -->
      <el-option
          v-for="item in platformOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
      />
    </el-select>
    <el-select
        v-model="selectedAppVersion"
        size="mini"
        style="width: 240px"
        :placeholder="$t('performance.appVersion')"
        @change="getAppVersion(1)"
    >
      <!--  上面接口请求通过之后，把数据赋值给platformOptions，然后循环里面需要的数据，比如appversion -->
      <el-option
          v-for="item in appVersion"
          :key="item.appVersion"
          :value="item.appVersion"
      />
    </el-select>
    <!--    @keydown.enter.native是监听回车事件-->
    <el-input
        v-model="resultId"
        size="mini"
        style="width: 240px"
        :placeholder="$t('performance.resultId')"
        @keydown.enter.native="resultIdS()"
    />
    <el-input
        v-model="caseId"
        style="width: 240px"
        size="mini"
        :placeholder="$t('performance.caseId')"
        @keydown.enter.native="resultIdS()"
    />
    <el-input
        v-model="udid"
        style="width: 240px"
        size="mini"
        :placeholder="$t('performance.udid')"
        @keydown.enter.native="resultIdS()"
    />
    <el-button type="primary" @click="getAndroidList(1)">{{ $t('搜索') }}</el-button>
  </div>
  <el-table :data="pageData['content']" border>
    <el-table-column
        width="80"
        :label="$t('performance.id')"
        prop="id"
        align="center"
        show-overflow-tooltip
    />
    <el-table-column
        width="100"
        :label="$t('performance.name')"
        prop="name"
        align="center"
        show-overflow-tooltip
    />
    <el-table-column
        width="180"
        :label="$t('performance.appVersion')"
        prop="appVersion"
        align="center"
        show-overflow-tooltip
    />
    <el-table-column
        width="180"
        :label="$t('performance.appPackage')"
        prop="appPackage"
        align="center"
        show-overflow-tooltip
    />
    <el-table-column
        width="80"
        :label="$t('performance.fps')"
        prop="fps"
        align="center"
        show-overflow-tooltip
    />
    <el-table-column
        width="160"
        :label="$t('performance.phyRSS')"
        prop="phyRSS"
        align="center"
        show-overflow-tooltip
    />
    <el-table-column
        width="80"
        :label="$t('performance.vmRSS')"
        prop="vmRSS"
        align="center"
        show-overflow-tooltip
    />
    <el-table-column
        width="80"
        :label="$t('performance.totalPSS')"
        prop="totalPSS"
        align="center"
        show-overflow-tooltip
    />
    <el-table-column
        width="80"
        :label="$t('performance.cpu')"
        prop="cpu"
        align="center"
        show-overflow-tooltip
    />
    <el-table-column
        width="80"
        :label="$t('performance.platform')"
        prop="platform"
        align="center"
        show-overflow-tooltip
    />
    <el-table-column
        width="180"
        :label="$t('performance.udid')"
        prop="udid"
        align="center"
        show-overflow-tooltip
    />
    <el-table-column
        width="180"
        :label="$t('performance.createTime')"
        prop="createTime"
        align="center"
        show-overflow-tooltip
    />
  </el-table>
  <pageable
      :is-page-set="true"
      :total="pageData['totalElements']"
      :current-page="pageData['number'] + 1"
      :page-size="pageData['size']"
      @change="getAndroidList"
  ></pageable>
</template>
