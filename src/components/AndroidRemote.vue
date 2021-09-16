<script setup>
import {useRouter} from "vue-router";

const router = useRouter()
</script>

<template>
  <el-page-header
      @back="router.go(-1)"
      content="远程控制"
      style="margin-bottom: 20px"
  >
  </el-page-header>
</template>