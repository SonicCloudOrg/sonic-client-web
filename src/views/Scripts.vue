<script setup>
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import Pageable from '../components/Pageable.vue';
import ScriptUpdate from '../components/ScriptUpdate.vue';
import axios from '../http/axios';

const route = useRoute();
const id = ref(0);
const pageData = ref({});
const pageSize = ref(15);
const pageCurrNum = ref(1);
const name = ref('');
const dialogVisible = ref(false);
const open = () => {
  dialogVisible.value = true;
};
watch(dialogVisible, (newValue, oldValue) => {
  if (!newValue) {
    id.value = 0;
  }
});
const editScript = async (i) => {
  id.value = i;
  await open();
};
const flush = () => {
  dialogVisible.value = false;
  getScriptList();
};
const tableLoading = ref(false);
const getScriptList = (pageNum, pSize) => {
  tableLoading.value = true;
  pageSize.value = pSize || pageSize.value;
  pageCurrNum.value = pageNum || pageCurrNum.value;
  axios
    .get('/controller/scripts/list', {
      params: {
        projectId: route.params.projectId,
        name: name.value,
        page: pageCurrNum.value,
        pageSize: pageSize.value,
      },
    })
    .then((resp) => {
      pageData.value = resp.data;
      tableLoading.value = false;
    });
};
const deleteScript = (id) => {
  axios
    .delete('/controller/scripts', {
      params: {
        id,
      },
    })
    .then((resp) => {
      if (resp.code === 2000) {
        ElMessage.success({
          message: resp.message,
        });
        getScriptList();
      }
    });
};
onMounted(() => {
  getScriptList();
});
</script>

<template>
  <el-dialog v-model="dialogVisible" title="模板信息" width="1200px">
    <script-update
      v-if="dialogVisible"
      :id="id"
      :project-id="route.params.projectId"
      @flush="flush"
    />
  </el-dialog>
  <el-button size="mini" round type="primary" @click="open()"
    >新增模板</el-button
  >

  <el-table style="margin-top: 20px" border :data="pageData.content">
    <el-table-column align="center" width="80" property="id" label="脚本id" />
    <el-table-column header-align="center" property="name">
      <template #header>
        <el-input
          v-model="name"
          size="mini"
          placeholder="输入名称搜索"
          @input="getScriptList()"
        />
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      width="100"
      property="scriptLanguage"
      label="脚本语言"
    />
    <el-table-column align="center" width="150" label="操作">
      <template #default="scope">
        <el-button type="primary" size="mini" @click="editScript(scope.row.id)"
          >编辑</el-button
        >
        <el-popconfirm
          style="margin-left: 10px"
          :confirm-button-text="$t('form.confirm')"
          :cancel-button-text="$t('form.cancel')"
          icon="el-icon-warning"
          icon-color="red"
          title="确定删除该脚本模板吗？"
          @confirm="deleteScript(scope.row.id)"
        >
          <template #reference>
            <el-button type="danger" size="mini">删除</el-button>
          </template>
        </el-popconfirm>
      </template>
    </el-table-column>
  </el-table>
  <pageable
    :is-page-set="true"
    :total="pageData['totalElements']"
    :current-page="pageData['number'] + 1"
    :page-size="pageData['size']"
    @change="getScriptList"
  ></pageable>
</template>
