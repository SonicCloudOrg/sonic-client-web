<script setup>
import TestCaseList from '../components/TestCaseList.vue'
import {ref} from "vue";
import {useRoute} from "vue-router";

const route = useRoute()
const projectId = ref(route.params.projectId)
const platform = 1

</script>
<template>
  <test-case-list :project-id="projectId" :platform="platform"/>
</template>