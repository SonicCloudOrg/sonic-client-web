<script setup>
import {useRoute} from "vue-router";
import ElementUpdate from '../components/ElementUpdate.vue'
import {onMounted, ref, watch} from "vue";
import axios from "../http/axios";

const route = useRoute()
const dialogElement = ref(false)
const elementId = ref(0)
const pageData = ref({});
const pageSize = ref(15);
const name = ref("")
const types = ref([])
import Pageable from '../components/Pageable.vue'
import {ElMessage} from "element-plus";

watch(dialogElement, (newValue, oldValue) => {
  if (!newValue) {
    elementId.value = 0
  }
})
const editElement = async (id) => {
  elementId.value = id
  await open()
}
const open = () => {
  dialogElement.value = true
}
const flush = () => {
  dialogElement.value = false
  getElementList();
}
const getElementList = (pageNum, pSize) => {
  axios.get("/controller/elements/list", {
    params: {
      projectId: route.params.projectId,
      types: types.value.length > 0 ? types.value : undefined,
      name: name.value,
      page: pageNum || 1,
      pageSize: pSize || pageSize.value,
    }
  }).then(resp => {
    pageData.value = resp.data
  })
}
const deleteEle = (id) => {
  axios.delete("/controller/elements", {
    params: {
      id
    }
  }).then(resp => {
    if (resp['code'] === 2000) {
      ElMessage.success({
        message: resp['message'],
      });
      getElementList();
    }
  })
}
const filter = (e) => {
  types.value = e
  console.log(types.value)
}
onMounted(() => {
  getElementList();
})
</script>
<template>
  <el-dialog v-model="dialogElement" title="控件元素信息" width="600px">
    <element-update v-if="dialogElement" :project-id="route.params.projectId"
                    :element-id="elementId" @flush="flush"/>
  </el-dialog>
  <el-button size="mini" round type="primary" @click="open">添加控件元素</el-button>
  <el-table
      @filter-change="filter"
      :data="pageData['content']"
      style="width: 100%; margin-top: 20px"
      border
  >
    <el-table-column label="元素id" width="90" align="center" prop="id">
    </el-table-column>

    <el-table-column
        :show-overflow-tooltip="true"
        label="元素名称"
        width="260"
        header-align="center"
        prop="eleName"
    >
    </el-table-column>

    <el-table-column label="定位类型" width="130" align="center" :filters="[
        { text: 'id（resource-id）', value: 'id' },
        { text: 'xpath', value: 'xpath' },
        { text: 'name', value: 'name' },
        { text: 'cssSelector', value: 'cssSelector' },
        { text: '坐标', value: 'point' },
        { text: '图片', value: 'image' },
        { text: 'nsPredicate', value: 'nsPredicate' },
        { text: 'linkText', value: 'linkText' },
        { text: 'className', value: 'className' },
        { text: 'tagName', value: 'tagName' },
        { text: 'partialLinkText', value: 'partialLinkText' },
      ]">
      <template #default="scope">
        <span v-if="scope.row.eleType.length === 0">未指定</span>
        <span v-else>
              <el-tag size="medium" v-if="scope.row.eleType === 'image'"
              >图片</el-tag
              >
              <el-tag size="medium" v-else-if="scope.row.eleType === 'point'"
              >坐标</el-tag
              >
              <el-tag size="medium" v-else>{{ scope.row.eleType }}</el-tag>
            </span>
      </template>
    </el-table-column>

    <el-table-column
        :show-overflow-tooltip="true"
        label="元素值"
        header-align="center"
    >
      <template #default="scope">
        <el-image
            :z-index="5000"
            v-if="scope.row.eleType === 'image'"
            fit="contain"
            style="width: 100px; height: 100%; margin-top: 10px"
            :src="scope.row.eleValue"
            :preview-src-list="[scope.row.eleValue]"
        ></el-image>
        <span v-else-if="scope.row.eleValue">{{ scope.row.eleValue }}</span>
        <span v-else>未填写</span>
      </template>
    </el-table-column>

    <el-table-column label="操作" width="170" align="center">
      <template #default="scope">
        <el-button
            type="primary"
            size="mini"
            @click="editElement(scope.row.id)"
        >编辑
        </el-button
        >
        <el-popconfirm
            style="margin-left: 10px"
            confirmButtonText="确认"
            cancelButtonText="取消"
            @confirm="deleteEle(scope.row.id)"
            icon="el-icon-warning"
            iconColor="red"
            title="确定删除该元素吗？"
        >
          <template #reference>
            <el-button
                type="danger"
                size="mini"
            >删除
            </el-button
            >
          </template>
        </el-popconfirm>
      </template>
    </el-table-column>
  </el-table>
  <pageable :is-page-set="true" :total="pageData['totalElements']"
            :current-page="pageData['number']+1"
            :page-size="pageData['size']"
            @change="getElementList"></pageable>
</template>