<script setup>
import TestCaseList from '../components/TestCaseList.vue'
import {ref} from "vue";
import {useRoute} from "vue-router";

import {useI18n} from 'vue-i18n'
const {t: $t} = useI18n()

const route = useRoute()
const caseList = ref(null)
const projectId = ref(parseInt(route.params.projectId))
const platform = 2

</script>
<template>
  <el-button size="mini" round @click="caseList.open()" type="primary">${{androidTestCase.addCase}}</el-button>
  <test-case-list ref="caseList" :project-id="projectId" :platform="platform" :is-read-only="false"/>
</template>
