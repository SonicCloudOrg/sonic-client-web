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
import Pageable from '../components/Pageable.vue'

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
      page: pageNum || 1,
      pageSize: pSize || pageSize.value,
    }
  }).then(resp => {
    pageData.value = resp.data
  })
}
onMounted(()=>{
  getElementList();
})
</script>
<template>
  <el-dialog v-model="dialogElement" title="控件元素信息" width="600px">
    <element-update v-if="dialogElement" :project-id="route.params.projectId"
                    :element-id="elementId" @flush="flush"/>
  </el-dialog>
  <el-button size="mini" round type="primary" @click="open">添加控件元素</el-button>
  <pageable :is-page-set="true" :total="pageData['totalElements']"
            :current-page="pageData['number']+1"
            :page-size="pageData['size']"
            @change="getElementList"></pageable>
</template>