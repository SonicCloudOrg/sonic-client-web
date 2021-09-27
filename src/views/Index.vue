<script setup>
import {onMounted} from "vue";
import {useStore} from "vuex";
import {useRoute} from "vue-router";
import Header from "../components/Header.vue"

const store = useStore();
const route = useRoute();
onMounted(() => {
})
</script>

<template>
  <el-container>
    <Header></Header>
  </el-container>
</template>