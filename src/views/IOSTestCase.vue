<script setup>
import TestCaseList from '../components/TestCaseList.vue'
import {ref} from "vue";
import {useRoute} from "vue-router";

const route = useRoute()
const caseList = ref(null)
const projectId = ref(parseInt(route.params.projectId))
const platform = 2

</script>
<template>
  <el-button size="mini" round @click="caseList.open()" type="primary">添加用例</el-button>
  <test-case-list ref="caseList" :project-id="projectId" :platform="platform" :is-read-only="false"/>
</template>