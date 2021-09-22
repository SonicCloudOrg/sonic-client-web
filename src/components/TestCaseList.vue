<script setup>
import axios from "../http/axios";
import {ref, defineProps, onMounted} from "vue";

const props = defineProps({
  projectId: Number,
  platform: Number
})
const pageData = ref({});
const pageSize = ref(12);
const name = ref("")
const getTestCaseList = (pageNum) => {
  axios.get("/controller/testCases/list", {
    params: {
      projectId: props.projectId,
      platform: props.platform,
      name: name.value,
      page: pageNum || 1,
      pageSize: pageSize.value,
    }
  }).then(resp => {

  })
}
onMounted(() => {
  getTestCaseList();
})
</script>
<template>
  asd
  <!--  <el-table :data="pageData"></el-table>-->
  <pageable
      :isPageSet="true"
      :pageData="pageData"
      @changePage="getTestCaseList"
  ></pageable>
</template>